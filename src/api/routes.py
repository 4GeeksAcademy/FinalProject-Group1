"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException,  es_correo_valido, validar_contrasena
from flask_cors import CORS
import os
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import cloudinary.uploader as uploader

 
api = Blueprint('api', __name__)

 
# Allow CORS requests to this API
CORS(api)

@api.route("/health-check", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"}), 200


@api.route("/register", methods=["POST"])
def register_user():
    data_form = request.form
    print(f"Datos recibidos por request.form: {data_form}")

    data = {
        "email": data_form.get("email"),
        "password": data_form.get("password"),
        "username": data_form.get("username"),
        "fullname": data_form.get("fullname"),
        "is_active": True
    }

    if not data["email"] or not data["username"] or not data["password"]:
        return jsonify({"message": "Email, username and password are required"}), 400
    if not es_correo_valido(data["email"]):
        return jsonify({"message": "Email is invalids,"}), 400
    if not validar_contrasena(data["password"]):
        return jsonify({"message": "Password is invalid. Requires 8+ chars, upper/lower case, number, special char, and no 3 consecutive numbers."}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "The email address is already registered."}), 409
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "The username is already registered"}), 409
 
    salt = b64encode(os.urandom(16)).decode("utf-8")
    hashed_password = generate_password_hash(f"{data['password']}{salt}")

    nombre_para_url = data["username"]

    foto_url = "https://ui-avatars.com/api/?name={}&size=128&background=random&rounded=true".format(
        nombre_para_url
    )

    new_user = User(
        email=data["email"],
        password=hashed_password,
        fullname=data["fullname"],
        username=data["username"],
        foto_perfil=foto_url,
        is_active=data["is_active"],
        salt=salt,
    )

    db.session.add(new_user)

    try:
        db.session.commit()
        return jsonify({"message": "user created succesfuly"}), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "Error": f"{error.args}"}), 500
    
"""ruta de login Eli"""
@api.route("/login", methods=["POST"])
def login_user():
    data_form = request.form
    email = data_form.get("email")
    password = data_form.get("password")
    if not email or not password:
        return jsonify({"message": "Email y contraseña son requeridos"}), 400
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"message": "Email o contraseña incorrectos"}), 401
    if not user.check_password(password):
        return jsonify({"message": "Email o contraseña incorrectos"}), 401
    
    expires = timedelta(days=1)
    access_token = create_access_token(
    identity=user.id_usuario, 
    expires_delta=expires,
    additional_claims={
        "id": user.id_usuario,
        "username": user.username,
        "rol": user.rol
        }
)
    return jsonify({
        "message": "Login exitoso",
        "access_token": access_token,
        "user": user.serialize()
        }), 200

