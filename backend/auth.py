from flask import Blueprint, request, jsonify
from helpers import supabase, exec_sb, get_records, create_record, update_record, delete_record, token_required

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    res, err = exec_sb(lambda: supabase.auth.sign_in_with_password({"email": email, "password": password}))
    if err or not res.session:
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"access_token": res.session.access_token, "user": res.user.email}), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    userId = data.get("userId")
    if not email or not password or not userId:
        return jsonify({"error": "Missing credentials"}), 400
    if get_records("user", {"userId": userId}).data:
        return jsonify({"error": "userId already taken"}), 400

    res, err = exec_sb(lambda: supabase.auth.sign_up({"email": email, "password": password, "data": {"name": name}}))
    if err or not res.user:
        return jsonify({"error": "Failed to create user"}), 400

    create_record("user", {"userId": userId, "authId": res.user.id, "email": email, "name": name, "created_at": "now()"})
    return jsonify({"message": "User registered successfully", "user": email, "userId": userId}), 201

@auth_bp.route("/user/<string:user_id>", methods=["GET"])
def get_user(user_id):
    res = get_records("user", {"userId": user_id})
    if not res.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": res.data[0]}), 200

@auth_bp.route("/updateuser/<string:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.json
    update_record("user", "userId", user_id, {"name": data.get("name"), "email": data.get("email")})
    return jsonify({"message": "User updated successfully"}), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    return jsonify({
        "user": {
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "id": current_user.get("id")
        }
    }), 200