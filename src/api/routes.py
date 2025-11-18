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
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta


api = Blueprint('api', __name__)


# Allow CORS requests to this API
CORS(api)


@api.route("/health-check", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"}), 200

@api.route("/users/<int:user_id>", methods=["GET"])
def getUser(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.serialize()), 200

    


@api.route("/user", methods=["PUT"])
@jwt_required()
def updateUser():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id) 
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() #or {}
    if data is None:
        return jsonify({"message": "Invalid JSON or no data provided"}), 400
    
    
    #Nos traemos los campos a actualizar

    email = data.get("email")
    fullname = data.get("fullname")
    username = data.get("username")

    if email:
        if not val_email(email):
            return jsonify({"message": "Email is invalid"}), 400
        
        # Verificar si ya existe el email

        existing_email_user = User.query.filter_by(email=email).first()
        if existing_email_user and existing_email_user.id != current_user_id:
            return jsonify({"message": "This email is already registered"}), 400

        user.email = email

    
    if username:
        # Verificar si ya existe el username
        existing_username_user = User.query.filter_by(username=username).first()
        if existing_username_user and existing_username_user.id != current_user_id:
            return jsonify({"message": "This username is already in use"}), 400


    if email:
        if not val_email(email):
            return jsonify({"message": "Email is invalid,"}), 400
        user.email = email
    if fullname:
        user.fullname = fullname
    if username:
        user.username = username

    try:
        db.session.commit()
        return jsonify({
            "message": "user updated succesfuly",
            "user": user.serialize()
        }), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error updating user", "Error": f"{error.args}"}), 500



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
        return jsonify({"message": "The email address is already registered."}), 422
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
@jwt_required()
def create_category():
    claims = get_jwt()
    if not claims.get("is_administrator"):
        return jsonify({"message": "Admin role required"}), 403
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Data not provided"}), 400

    name_category = data.get("name_category")

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


@api.route("/categories/<int:id>", methods=["PUT"])
@jwt_required()
def edit_category(id):
    claims = get_jwt()
    if not claims.get("is_administrator"):
        return jsonify({"message": "Admin role required"}), 403
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Data not provided"}), 400

    new_name = data.get("name_category")

    if not new_name or not new_name.strip():
            return jsonify({"message": "Category name cannot be empty"}), 400

    new_name = new_name.strip()

    category = Category.query.get(id)

    if category is None:
        return jsonify({"message": "Category not found"}), 404
    
    if new_name != category.name_category:
        existing = Category.query.filter_by(name_category=new_name).first()
        if existing:
            return jsonify({"message": "Category name already exists"}), 409

    category.name_category = new_name

    try:
        db.session.commit()
        return jsonify({
            "message": "Category updated successfully",
            "category": category.serialize()
        }), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error updating category",
            "error": f"{error.args}"
        }), 500


@api.route("/categories/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_category(id):
    claims = get_jwt()
    if not claims.get("is_administrator"):
        return jsonify({"message": "Admin role required"}), 403
    
    category = Category.query.get(id)
    if category is None:
        return jsonify({"message": "Category not found"}), 404
    
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({
            "message": "Category deleted successfully",
        }), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error deleting category",
            "error": f"{error.args}"
        }), 500

@api.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    # Obtener el ID del usuario actual usando el token JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "Invalid JSON or no data provided"}), 400

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    # Validación de campos de la password
    if not current_password or not new_password:
        return jsonify({"message": "Current and new password are required"}), 400

    # Verificar que la contraseña actual sea correcta
    is_valid = check_password_hash(user.password, f"{current_password}{user.salt}")
    if not is_valid:
        return jsonify({"message": "Current password is incorrect"}), 401

    # Validar la nueva contraseña con los parametros que definimoss
    from api.utils import val_password
    if not val_password(new_password):
        return jsonify({"message": "New password is invalid. It must have 8+ chars, uppercase, lowercase, number, and special char."}), 400

    # Generar y guardar la nueva contraseña hasheada
    new_hashed_password = generate_password_hash(f"{new_password}{user.salt}")
    user.password = new_hashed_password
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

@api.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username").strip()
    password = data.get("password").strip() 
 
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    user = User.query.filter_by(username=username).one_or_none() 
    if user is None:  
        return jsonify({"message": "Invalid username"}), 401 
    if not check_password_hash(user.password, f"{password}{user.salt}"): 
        return jsonify({"message": "Invalid credentials"}), 401
   
    is_admin = user.rol == "administrador"
    additional_claims = {"is_administrator": is_admin, "rol": user.rol}
    token = create_access_token(identity=str(user.id_user), expires_delta=timedelta(
        days=1), additional_claims=additional_claims)
 
    return jsonify({"msg": "Login successful", "token": token, "user_info": user.serialize()}), 200
