from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True)
