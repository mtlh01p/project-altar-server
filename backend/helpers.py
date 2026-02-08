from supabase import create_client
from flask import request
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

# -------------------------
# Auth helpers
# -------------------------
def get_current_user():
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return None
        user = supabase.auth.get_user(token)
        return user.user
    except Exception:
        return None

# -------------------------
# Supabase helpers
# -------------------------
def exec_sb(fn):
    try:
        return fn(), None
    except Exception as e:
        return None, str(e)

def get_records(table, filters=None):
    q = supabase.table(table).select("*")
    for k, v in (filters or {}).items():
        q = q.eq(k, v)
    return q.execute()

def create_record(table, payload):
    return supabase.table(table).insert(payload).execute()

def update_record(table, field, value, payload):
    return supabase.table(table).update(payload).eq(field, value).execute()

def delete_record(table, field, value):
    return supabase.table(table).delete().eq(field, value).execute()


# -------------------------# Token decorator
# -------------------------
from functools import wraps
from flask import jsonify
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token:
            return jsonify({"error": "Token is missing!"}), 401
        user = supabase.auth.get_user(token)
        if not user.user:
            return jsonify({"error": "Invalid token!"}), 401
        return f(current_user=user.user, *args, **kwargs)
    return decorated
