from flask import Blueprint, request, jsonify
from helpers import get_current_user, get_records, create_record, update_record, delete_record

transactions_bp = Blueprint("transactions", __name__)

@transactions_bp.route("/create", methods=["POST"])
def create_transaction():
    """Create a new transaction"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        productIds = data.get("productIds", [])
        total = data.get("total", 0)
        userId = data.get("userId")  # Allow userId to be passed explicitly
        inventoryId = data.get("inventoryId")

        # Get user from auth header if available
        user = get_current_user()
        if user and not userId:
            userId = user.id

        if not productIds or not isinstance(productIds, list) or len(productIds) == 0:
            return jsonify({"error": "Missing or invalid productIds"}), 400
        
        if not total or total <= 0:
            return jsonify({"error": "Total must be greater than 0"}), 400

        # Create transaction record in Supabase
        # Note: transactionId is auto-generated, created_at has default
        transaction_data = {
            "productIds": productIds,
            "total": float(total),
            "userId": userId,
            "inventoryId": inventoryId,
        }

        print(f"Creating transaction with data: {transaction_data}")
        result = create_record("transactions", transaction_data)
        
        if result.data and len(result.data) > 0:
            transaction = result.data[0]
            return jsonify({
                "transactionId": transaction.get("transactionId"),
                "productIds": transaction.get("productIds"),
                "total": transaction.get("total"),
                "userId": transaction.get("userId"),
                "inventoryId": transaction.get("inventoryId"),
                "created_at": transaction.get("created_at"),
            }), 201
        else:
            print(f"No data in response: {result}")
            return jsonify({"error": "Failed to create transaction in database"}), 500

    except Exception as e:
        import traceback
        print(f"Error creating transaction: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Transaction creation error: {str(e)}"}), 500


@transactions_bp.route("/", methods=["GET"])
def list_transactions():
    """Get all transactions, optionally filtered by userId"""
    try:
        user_id = request.args.get("userId")
        
        try:
            if user_id:
                # Get transactions for specific user
                result = get_records("transactions", {"userId": user_id})
            else:
                # Get all transactions
                result = get_records("transactions", {})
            
            if result.data:
                transactions = []
                for t in result.data:
                    transactions.append({
                        "transactionId": t.get("transactionId"),
                        "productIds": t.get("productIds"),
                        "total": t.get("total"),
                        "userId": t.get("userId"),
                        "inventoryId": t.get("inventoryId"),
                        "created_at": t.get("created_at"),
                    })
                return jsonify({"transactions": transactions}), 200
            else:
                return jsonify({"transactions": []}), 200
        except Exception as query_err:
            print(f"Database query error: {str(query_err)}")
            # Return empty list if table doesn't exist
            return jsonify({"transactions": []}), 200

    except Exception as e:
        import traceback
        print(f"Error fetching transactions: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to fetch transactions: {str(e)}"}), 500


@transactions_bp.route("/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    """Get a specific transaction by ID"""
    try:
        result = get_records("transactions", {"transactionId": transaction_id})
        
        if result.data:
            t = result.data[0]
            return jsonify({
                "transactionId": t.get("transactionId"),
                "productIds": t.get("productIds"),
                "total": t.get("total"),
                "userId": t.get("userId"),
                "inventoryId": t.get("inventoryId"),
                "created_at": t.get("created_at"),
            }), 200
        else:
            return jsonify({"error": "Transaction not found"}), 404

    except Exception as e:
        print(f"Error fetching transaction: {str(e)}")
        return jsonify({"error": str(e)}), 500

