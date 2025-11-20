"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Recipe, Ingredient, RecipeIngredient, difficultyEnum, stateRecipeEnum, UnitEnum, Category
from api.utils import generate_sitemap, APIException,  val_email, val_password
from flask_cors import CORS
import os
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
from functools import wraps
import json
from .cloudinary_service import cloudinary_service
from sqlalchemy import select
from .admin_decorator import admin_required


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

    data = request.get_json()  # or {}
    if data is None:
        return jsonify({"message": "Invalid JSON or no data provided"}), 400

    # Nos traemos los campos a actualizar

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
        existing_username_user = User.query.filter_by(
            username=username).first()
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
    is_valid = check_password_hash(
        user.password, f"{current_password}{user.salt}")
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
   
    is_admin = user.rol == "admin"
    additional_claims = {"is_administrator": is_admin, "rol": user.rol}
    token = create_access_token(identity=str(user.id_user), expires_delta=timedelta(
        days=1), additional_claims=additional_claims)

    return jsonify({"msg": "Login successful", "token": token, "user_info": user.serialize()}), 200


@api.route("/recipes", methods=["POST"])
@jwt_required()
def create_recipe():

    user_id = get_jwt_identity()
    claims = get_jwt()
    is_admin = claims.get("rol") == "admin"

    data_form = request.form
    data_files = request.files

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

    if is_admin:
        initial_state = stateRecipeEnum.PUBLISHED
        success_message = "Recipe created and successfully published."
    else:
        initial_state = stateRecipeEnum.PENDING
        success_message = "Recipe created and submitted for review."

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
            difficulty=difficultyEnum(
                data_form.get("difficulty").strip().lower()),
            preparation_time_min=int(data_form.get("prep_time_min")),
            portions=int(data_form.get("portions")),
            state_recipe=initial_state,
            user_id=user_id,
            category_id=int(data_form.get("category_id"))
        )

        db.session.add(new_recipe)
        db.session.flush()

        recipe_ingredient_objects = []
        for item in ingredients_list:
            ingredient_name = item.get("name").strip().lower()
            quantity = float(item.get("quantity"))
            unit_enum_value = UnitEnum(
                item.get("unit_measure").strip().lower())

            ingredient_catalog = Ingredient.query.filter_by(
                name=ingredient_name).one_or_none()

            if ingredient_catalog is None:
                ingredient_catalog = Ingredient(
                    name=ingredient_name,
                    calories_per_100=0.0,
                    protein_per_100=0.0,
                    carbs_per_100=0.0,
                    fat_per_100=0.0,
                    volume_to_mass_factor=None,
                    unit_to_mass_factor=None
                )
                db.session.add(ingredient_catalog)
                db.session.flush()

            new_recipe_ingredient = RecipeIngredient(
                quantity=quantity,
                unit_measure=unit_enum_value,
                recipe=new_recipe,
                ingredient_catalog=ingredient_catalog
            )
            recipe_ingredient_objects.append(new_recipe_ingredient)

        db.session.add_all(recipe_ingredient_objects)
        db.session.commit()

        return jsonify({"message": success_message, "status": initial_state.value}), 201

    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error saving the recipe to the database.", "details": str(error)}), 400


@api.route("/admin/recipes/status", methods=["GET"])
@admin_required()
def get_admin_recipes_by_status():
    try:
        status_param = request.args.get('status')
        if status_param == "pending":
            status_filter = stateRecipeEnum.PENDING
        elif status_param == "rejected":
            status_filter = stateRecipeEnum.REJECTED
        else:
            status_filter = stateRecipeEnum.PUBLISHED

        query = (
            db.select(Recipe)
            .filter(Recipe.state_recipe == status_filter)
            .order_by(Recipe.created_at.desc())
        )

        recipes = db.session.execute(query).scalars().all()
        response_body = [recipe.serialize() for recipe in recipes]

        return jsonify({
            "message": f"List of successfully {status_param} recipes for Admin",
            "recipes": response_body
        }), 200

    except Exception as error:
        print(f"Error al obtener recetas: {error}")
        return jsonify({
            "message": "Internal server error while processing the request.", "Details": str(error)
        }), 500


@api.route("/recipes/<int:recipe_id>", methods=["PUT"])
@jwt_required()
def edit_recipe(recipe_id):

    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("rol") == "admin"

    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None:
        return jsonify({"message": f"Recipe with ID {recipe_id} not found."}), 404

    if is_admin:
        pass

    else:
        if recipe.state_recipe == stateRecipeEnum.PUBLISHED:
            return jsonify({"message": "Access denied. Only administrators can edit published recipes."}), 403

        if recipe.state_recipe == stateRecipeEnum.PENDING:
            if recipe.user_id != user_id:
                return jsonify({"message": "Access denied. You can only edit your own pending recipes."}), 403
        else:
            return jsonify({"message": "Access denied. You do not have permission to edit this recipe."}), 403

    data_form = request.form
    data_files = request.files

    ingredients_str = data_form.get("ingredients_json")
    if not ingredients_str:
        return jsonify({"message": "Ingredients data is missing."}), 400

    try:
        ingredients_list = json.loads(ingredients_str)
        if not isinstance(ingredients_list, list):
            raise ValueError("Ingredients must be a list of objects.")
    except Exception as error:
        return jsonify({"message": "Invalid ingredients format.", "details": str(error)}), 400

    try:
        recipe.title = data_form.get("title", recipe.title)
        recipe.steps = data_form.get("steps", recipe.steps)
        recipe.preparation_time_min = int(data_form.get(
            "prep_time_min", recipe.preparation_time_min))
        recipe.portions = int(data_form.get("portions", recipe.portions))
        recipe.category_id = int(data_form.get(
            "category_id", recipe.category_id))
        new_difficulty_str = data_form.get("difficulty")
        if new_difficulty_str:
            recipe.difficulty = difficultyEnum(
                new_difficulty_str.strip().lower())

    except ValueError as error:
        db.session.rollback()
        return jsonify({"message": "Invalid data type for one or more fields.", "details": str(error)}), 400
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error updating basic recipe fields.", "details": str(error)}), 400

    image_file = data_files.get("image")
    if image_file:
        try:
            new_image_url = cloudinary_service.upload_image(
                image_file, folder_name="recipe_images")
            recipe.image = new_image_url

        except Exception as error:
            return jsonify({"message": f"Image update failed. Details: {str(error)}"}), 500
    try:
        recipe.recipe_ingredients_details = []
        recipe_ingredient_objects = []
        for item in ingredients_list:
            ingredient_name = item.get("name").strip().lower()
            quantity = float(item.get("quantity"))
            unit_enum_value = UnitEnum(
                item.get("unit_measure").strip().lower())

            ingredient_catalog = Ingredient.query.filter_by(
                name=ingredient_name).one_or_none()
            if ingredient_catalog is None:
                ingredient_catalog = Ingredient(
                    name=ingredient_name, calories_per_100=0.0, protein_per_100=0.0, carbs_per_100=0.0, fat_per_100=0.0)
                db.session.add(ingredient_catalog)
                db.session.flush()

            new_recipe_ingredient = RecipeIngredient(
                quantity=quantity,
                unit_measure=unit_enum_value,
                recipe=recipe,
                ingredient_catalog=ingredient_catalog
            )
            recipe_ingredient_objects.append(new_recipe_ingredient)

        db.session.add_all(recipe_ingredient_objects)
        db.session.commit()

        return jsonify({"message": "Recipe updated successfully.", "recipe": recipe.serialize()}), 200

    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error updating recipe details or ingredients.", "details": str(error)}), 400


@api.route("/recipes/<int:recipe_id>", methods=["GET"])
# @jwt_required()
def get_one_recipe(recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None:
        return jsonify({"message": f"Recipe with ID {recipe_id} not found."}), 404
    return jsonify({
        "message": "Recipe found successfully",
        "recipe": recipe.serialize()
    }), 200
