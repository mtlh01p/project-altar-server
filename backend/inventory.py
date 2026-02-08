from flask import Blueprint, request, jsonify
import supabase
from helpers import get_current_user, get_records, create_record, update_record, delete_record

inventory_bp = Blueprint("inventory_bp", __name__)

@inventory_bp.route("/", methods=["GET"])
def get_inventory():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    res = get_records("inventory", {"ownerUserId": user.id})
    return jsonify(res.data), 200
    

@inventory_bp.route("/", methods=["POST"])
def create_inventory():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    if not data.get("name"):
        return jsonify({"error": "Missing inventory name"}), 400
    res = create_record("inventory", {"name": data["name"], "ownerUserId": user.id})
    return jsonify(res.data[0]), 201

# In your Flask backend
@inventory_bp.route("/", methods=["GET"])
def get_inventories():
    # This tells Supabase: "Get all columns from inventory, 
    # and also get the 'name' column from the related 'users' table"
    res = supabase.table("inventory").select("*, users(name)").execute()
    return jsonify({"inventories": res.data}), 200