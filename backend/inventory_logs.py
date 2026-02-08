from flask import Blueprint, request, jsonify
from helpers import create_record, get_records, delete_record

logs_bp = Blueprint("logs_bp", __name__)

@logs_bp.route("/<int:inventory_id>", methods=["GET"])
def get_inventory_logs(inventory_id):
    res = get_records("inventory_log", {"inventoryId": inventory_id})
    return jsonify({"logs": res.data}), 200

@logs_bp.route("/", methods=["POST"])
def add_inventory_log():
    data = request.json
    if not data.get("inventoryId") or not data.get("action"):
        return jsonify({"error": "Missing log details"}), 400
    create_record("inventory_log", {
        "inventoryId": data["inventoryId"],
        "action": data["action"],
        "timestamp": "now()"
    })
    return jsonify({"message": "Inventory log added successfully"}), 201

@logs_bp.route("/<int:inventory_id>", methods=["DELETE"])
def clear_inventory_logs(inventory_id):
    delete_record("inventory_log", "inventoryId", inventory_id)
    return jsonify({"message": "Inventory logs cleared successfully"}), 200
