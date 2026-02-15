import uuid
from flask import Blueprint, request, jsonify
import supabase
from helpers import create_record, get_records, update_record, delete_record

products_bp = Blueprint("products_bp", __name__)

@products_bp.route("/", methods=["POST"])
def create_product():
    data = request.json
    if not data.get("name") or data.get("price") is None:
        return jsonify({"error": "Missing product details"}), 400
    
    generated_id = str(uuid.uuid4())
    
    # Note: ensure "product_name" matches your DB column name
    new_record = {
        "productId": generated_id,
        "name": data["name"],
        "description": data.get("description"),
        "stock": data.get("stock"),
        "inventoryId": data.get("inventoryId"),
        "price": data["price"],
        "created_at": "now()"
    }
    
    res = create_record("product", new_record)
    
    # Return the first item of the created record so the frontend can display it
    if res.data:
        return jsonify(res.data[0]), 201
    return jsonify({"error": "Failed to create record"}), 500

@products_bp.route("/<product_id>", methods=["GET"])
def get_product(product_id):
    res = get_records("product", {"productId": product_id})
    if not res.data:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"product": res.data[0]}), 200

# Get product by inventory ID
@products_bp.route("/inventory/<inventory_id>", methods=["GET"])
def get_products_by_inventory(inventory_id):
    res = get_records("product", {"inventoryId": inventory_id})
    # res.data[0] should contain 'id' (the UUID)
    return jsonify({"products": res.data}), 200

@products_bp.route("/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.json

    update_data = {}
    if "name" in data:
        update_data["name"] = data["name"]
    if "description" in data:
        update_data["description"] = data["description"]
    if "price" in data:
        update_data["price"] = data["price"]
    if "stock" in data:
        update_data["stock"] = data["stock"]

    if not update_data:
        return jsonify({"error": "No valid fields provided"}), 400

    res = update_record("product", "productId", product_id, update_data)

    if not res.data:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"message": "Update successful", "data": res.data[0]}), 200

@products_bp.route("/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    res = delete_record("product", "productId", product_id)
    


