# routes/cart_items.py
from flask import Blueprint, request, jsonify
from helpers import get_current_user, get_records, create_record, update_record, delete_record

cart_items_bp = Blueprint("cart_items_bp", __name__, url_prefix="/api/cart-items")

# Add item to cart
@cart_items_bp.route("/add", methods=["POST"])
def add_to_cart_item():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    cart_id = data.get("cartId")
    product_id = data.get("productId")
    quantity = data.get("quantity", 1)

    # check if cart belongs to user
    cart = get_records("cart", {"cartId": cart_id, "userId": user["id"]}).data
    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    # check if product already in cart
    existing = get_records("cart_items", {"cartId": cart_id, "productId": product_id}).data
    if existing:
        # increment quantity
        new_qty = existing[0].get("quantity", 1) + quantity
        update_record("cart_items", {"quantity": new_qty}, {"id": existing[0]["id"]})
    else:
        create_record("cart_items", {"cartId": cart_id, "productId": product_id, "quantity": quantity})

    return jsonify({"message": "Item added"}), 200

# Update item quantity
@cart_items_bp.route("/<int:item_id>", methods=["PATCH"])
def update_cart_item(item_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    new_qty = data.get("quantity")
    if new_qty is None:
        return jsonify({"error": "Missing quantity"}), 400

    item = get_records("cart_items", {"id": item_id}).data
    if not item:
        return jsonify({"error": "Item not found"}), 404

    cart_id = item[0]["cartId"]
    # check cart belongs to user
    cart = get_records("cart", {"cartId": cart_id, "userId": user["id"]}).data
    if not cart:
        return jsonify({"error": "Unauthorized"}), 401

    if new_qty <= 0:
        delete_record("cart_items", {"id": item_id})
    else:
        update_record("cart_items", {"quantity": new_qty}, {"id": item_id})

    return jsonify({"message": "Item updated"}), 200

# Delete item
@cart_items_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_cart_item(item_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    item = get_records("cart_items", {"id": item_id}).data
    if not item:
        return jsonify({"error": "Item not found"}), 404

    cart_id = item[0]["cartId"]
    cart = get_records("cart", {"cartId": cart_id, "userId": user["id"]}).data
    if not cart:
        return jsonify({"error": "Unauthorized"}), 401

    delete_record("cart_items", {"id": item_id})
    return jsonify({"message": "Item deleted"}), 200
