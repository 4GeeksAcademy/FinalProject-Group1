"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Category
from api.utils import generate_sitemap, APIException,  val_email, val_password
from flask_cors import CORS
import os
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta


api = Blueprint('api', __name__)


# Allow CORS requests to this API
CORS(api)


@api.route("/health-check", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"}), 200


@api.route("/register", methods=["POST"])
def register_user():

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Invalid JSON or no data provided"}), 400

    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    fullname = data.get("fullname")

    if not email or not username or not password:
        return jsonify({"message": "Email, username and password are required"}), 400
    if not val_email(email):
        return jsonify({"message": "Email is invalid,"}), 400
    if not val_password(password):
        return jsonify({"message": "Password is invalid. Requires 8+ chars, upper/lower case, number, special char, and no 3 consecutive numbers."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "The email address is already registered."}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "The username is already registered"}), 409

    salt = b64encode(os.urandom(16)).decode("utf-8")
    hashed_password = generate_password_hash(f"{data['password']}{salt}")

    new_user = User(
        email=email,
        password=hashed_password,
        fullname=fullname,
        username=username,
        salt=salt,
    )

    db.session.add(new_user)

    try:
        db.session.commit()
        return jsonify({
            "message": "user created succesfuly",
            "user": new_user.serialize()
        }), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "Error": f"{error.args}"}), 500

# Endpoint para Category


@api.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name_category).all()
    data = [category.serialize() for category in categories]
    return jsonify(data), 200


@api.route("/categories", methods=["POST"])
def create_category():
    data = request.get_json(Silent=True)

    if data is None:
        return jsonify({"message": "Data not provided"}), 400

    name_category = data.get("name_category")
    description = data.get("description")

    if not name_category or not name_category.strip():
        return jsonify({"message": "Category name is required"}), 400

    name_category = name_category.strip()

    existing_category = Category.query.filter_by(
        name_category=name_category
    ).first()

    if existing_category:
        return jsonify({"message": "Category already exists"}), 409

        new_category = Category(
            name_category=name_category,
            description=description
        )

    db.session.add(new_category)

    try:
        db.session.commit()
        return jsonify({
            "message": "Category created successfully",
            "category": new_category.serialize()
        }), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error creating category",
            "error": f"{error.args}"
        }), 500
