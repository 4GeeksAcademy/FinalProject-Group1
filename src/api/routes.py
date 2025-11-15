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

@api.route("/users/<int:user_id>", methods=["GET"])
def getUser(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user.serialize()), 200

    

@api.route("/users/<int:user_id>", methods=["PUT"])
# @api.route("user/", methods=["PUT"])
# @jwt_required
def updateUser(user_id): #quitar el user_id y dejarlo vacio
    # current_user_id = get_jwt_identity()
    user = User.query.get(user_id) #reemplazar "user_id" por "current_user_id"
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() #or {}
    if data is None:
        return jsonify({"message": "Invalid JSON or no data provided"}), 400
    
    
    #Nos traemos los campos a actualizar

    email = data.get("email")
    fullname = data.get("fullname")
    username = data.get("username")

    #validaciones de los campos
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
def create_category():
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
def edit_category():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Data not provided"}), 400
    
    category = Category.query.get(id)

    new_name = data.get.id("name_category")

    if new_name is not None:
        new_name = new_name.strip()
        if new_name == "":
            return jsonify({"message": "Category name cannot be empty"}), 400
        
    if new_name and new_name != category.name_category:
        existing = Category.query.filter_by(name_category=new_name).first()
        if existing:
            return jsonify({"message": "Category name already exists"}), 400
        
    if new_name:
        category.name_category.id = new_name


@api.route("/categories", methods=["DELETE"])
def delete_category():
    
    category = Category.query.get(id)

    data = ""

    delete_category = data.get("name_category")

    if delete_category:
        pass
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
        return jsonify({"message": "Ivalid username"}), 401 
    if not check_password_hash(user.password, f"{password}{user.salt}"): 
        return jsonify({"message": "Ivalid credentials"}), 401
   
    is_admin = user.rol == "admin"
    additional_claims = {"is_administrator": is_admin, "rol": user.rol}
    token = create_access_token(identity=str(user.id_user), expires_delta=timedelta(
        days=1), additional_claims=additional_claims)
 
    return jsonify({"msg": "Login successful", "token": token, "user_info": user.serialize()}), 200



def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("is_administrator", False) is True:
                return fn(*args, **kwargs)
            else:
                return jsonify({"msg": "Acceso denegado. Se requiere rol de administrador."}), 403
        return decorator
    return wrapper


@api.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"message": "User not found or deleted."}), 404
    return jsonify({"user": user.serialize()}), 200


@api.route("/recipes", methods=["POST"])
@admin_required()
def create_recipe():
    data_form = request.form
    data_files = request.files

    user_id = get_jwt_identity()

    image_file = data_files.get("image")
    ingredients_str = data_form.get("ingredients_json")

    required_fields = ["title", "steps", "prep_time_min",
                       "difficulty", "portions", "category_id"]
    if any(item not in data_form for item in required_fields) or not image_file or not ingredients_str:
        return jsonify({"message": "Required fields or the image are missing."}), 400

    try:
        ingredients_list = json.loads(ingredients_str)
        if not isinstance(ingredients_list, list):
            raise ValueError("Ingredients must be a list of objects.")
    except Exception as error:
        return jsonify({"message": "Ingredients must be a list of objects", "details": str(error)}), 400

    try:
        image_url = cloudinary_service.upload_image(
            image_file, folder_name="recipe_images")
    except Exception as error:
        return jsonify({"message": f"Image upload failed. Details: {str(error)}"}), 500

    try:
        new_recipe = Recipe(
            title=data_form.get("title"),
            steps=data_form.get("steps"),
            image=image_url,
            difficulty=difficultyEnum(data_form.get("difficulty").strip().lower()),
            preparation_time_min=int(data_form.get("prep_time_min")),
            portions=int(data_form.get("portions")),
            state_recipe=stateRecipeEnum.PUBLISHED,
            user_id=user_id,
            category_id=int(data_form.get("category_id"))
        )

        ingredient_objects = []
        for item in ingredients_list:
            unit_enum_value = UnitEnum(item.get("unit_measure").strip().lower())
            new_ingredient = Ingredient(
                name=item.get("name"),
                quantity=float(item.get("quantity")),
                unit_measure=unit_enum_value,
                density_id=int(item.get("density_id"))
            )
            ingredient_objects.append(new_ingredient)

        new_recipe.ingredient_recipe = ingredient_objects

        db.session.add(new_recipe)
        db.session.commit()

        return jsonify({"message": "Recipe created and successfully published."}), 201

    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error saving the recipe to the database.", "details": str(error)}), 400