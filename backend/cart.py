from flask import Blueprint, request, jsonify
from helpers import get_current_user, get_records, create_record, update_record, delete_record

cart_bp = Blueprint("cart_bp", __name__)

# Get all carts for current user
@cart_bp.route("/cart", methods=["GET"])
def get_carts():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = get_records("cart", {"userId": user.id})
    return jsonify(res.data), 200

# Create new cart
@cart_bp.route("/cart", methods=["POST"])
def create_cart():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    cart_data = {
        "userId": data.get("userId") or user.id
    }

    res = create_record("cart", cart_data)
    return jsonify(res.data[0]), 201

# Get items in a cart
@cart_bp.route("/cart/<int:cart_id>/items", methods=["GET"])
def get_cart_items(cart_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = get_records("cart_items", {"cartId": cart_id})
    return jsonify(res.data), 200

# Add item to cart
@cart_bp.route("/cart/<int:cart_id>/items", methods=["POST"])
def add_cart_item(cart_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if not data.get("productId"):
        return jsonify({"error": "Missing productId"}), 400

    record = {
        "cartId": cart_id,
        "productId": data["productId"]
    }

    res = create_record("cart_items", record)
    return jsonify(res.data[0]), 201

# Remove item from cart
@cart_bp.route("/cart/items/<int:item_id>", methods=["DELETE"])
def delete_cart_item(item_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    res = delete_record("cart_items", item_id)
    return jsonify({"success": True}), 200
