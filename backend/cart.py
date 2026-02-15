from flask import Blueprint, request, jsonify
from helpers import get_current_user, get_records, create_record, update_record, delete_record

cart_bp = Blueprint("cart_bp", __name__)

# Get all carts for current user
@cart_bp.route("/cart", methods=["GET"])
def get_carts():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = get_records("cart", {"ownerUserId": user.id})
    return jsonify({"carts": res.data}), 200

# Create new cart
@cart_bp.route("/cart", methods=["POST"])
def create_cart():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}

    cart_data = {
        "ownerUserId": user.id,
        "cartName": data.get("cartName")
    }

    res = create_record("cart", cart_data)
    return jsonify(res.data[0]), 201

# -------------------------
# Get items in a cart
# -------------------------
@cart_bp.route("/cart/<uuid:cart_id>/items", methods=["GET"])
def get_cart_items(cart_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    # Fetch cart items with product info
    res = get_records("cart_items", {"cartId": str(cart_id)})
    items = []
    for item in res.data:
        # Include product details (name, price)
        product = get_records("product", {"productId": item["productId"]}).data
        items.append({
            "id": item["id"],
            "quantity": item["quantity"],
            "product": product[0] if product else None
        })

    return jsonify({"items": items}), 200


# -------------------------
# Add item to cart
# -------------------------
@cart_bp.route("/cart/<uuid:cart_id>/items", methods=["POST"])
def add_cart_item(cart_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    product_id = data.get("productId")
    if not product_id:
        return jsonify({"error": "Missing productId"}), 400

    # Check if item already exists in cart
    existing = get_records("cart_items", {"cartId": str(cart_id), "productId": product_id}).data
    if existing:
        # Increment quantity
        update_record("cart_items", "id", existing[0]["id"], {"quantity": existing[0]["quantity"] + 1})
        return jsonify({"message": "Quantity updated"}), 200
    else:
        # Insert new item
        new_item = create_record("cart_items", {"cartId": str(cart_id), "productId": product_id, "quantity": 1})
        return jsonify(new_item.data[0]), 201


# -------------------------
# Remove item from cart
# -------------------------
@cart_bp.route("/cart/items/<int:item_id>", methods=["DELETE"])
def remove_cart_item(item_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    existing = get_records("cart_items", {"id": item_id}).data
    if not existing:
        return jsonify({"error": "Item not found"}), 404

    item = existing[0]
    if item["quantity"] > 1:
        update_record("cart_items", "id", item_id, {"quantity": item["quantity"] - 1})
    else:
        delete_record("cart_items", "id", item_id)

    return jsonify({"success": True}), 200

@cart_bp.route("/cart/items/<int:item_id>", methods=["PATCH"])
def update_cart_item_quantity(item_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if "quantity" not in data:
        return jsonify({"error": "Missing quantity"}), 400

    # Get existing item
    existing = get_records("cart_items", {"id": item_id}).data
    if not existing:
        return jsonify({"error": "Item not found"}), 404

    # Update quantity
    update_record("cart_items", "id", item_id, {"quantity": data["quantity"]})

    return jsonify({"id": item_id, "quantity": data["quantity"]}), 200

@cart_bp.route("/cart/<uuid:cart_id>", methods=["DELETE"])
def delete_cart(cart_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Delete all items in cart first
        delete_record("cart_items", "cartId", str(cart_id))
        # Delete the cart itself
        delete_record("cart", "id", str(cart_id))
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500