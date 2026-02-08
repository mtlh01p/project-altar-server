from flask import Blueprint, request, jsonify
from helpers import create_record, get_records, delete_record

collab_bp = Blueprint("collab_bp", __name__)

@collab_bp.route("/", methods=["POST"])
def add_collaborator():
    data = request.json
    if not data.get("inventoryId") or not data.get("collaboratorUserId"):
        return jsonify({"error": "Missing collaborator details"}), 400
    create_record("inventory_users", {
        "inventoryId": data["inventoryId"],
        "collaboratorUserId": data["collaboratorUserId"],
        "added_at": "now()"
    })
    return jsonify({"message": "Collaborator added successfully"}), 201

@collab_bp.route("/<int:inventory_id>", methods=["GET"])
def get_collaborators(inventory_id):
    res = get_records("inventory_users", {"inventoryId": inventory_id})
    return jsonify({"collaborators": res.data}), 200

@collab_bp.route("/", methods=["DELETE"])
def remove_collaborator():
    data = request.json
    delete_record("inventory_users", "inventoryId", data.get("inventoryId"))
    return jsonify({"message": "Collaborator removed successfully"}), 200
