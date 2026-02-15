from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from inventory import inventory_bp
from products import products_bp
from collaborators import collab_bp
from cart import cart_bp
from inventory_logs import logs_bp
from transactions import transactions_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(cart_bp, url_prefix="/api")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(collab_bp, url_prefix="/api/collaborator")
app.register_blueprint(logs_bp, url_prefix="/api/logs")
app.register_blueprint(transactions_bp, url_prefix="/api/transactions")

if __name__ == "__main__":
    app.run(debug=True)
