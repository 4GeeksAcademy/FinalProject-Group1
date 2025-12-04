"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Recipe, Ingredient, RecipeIngredient, difficultyEnum, stateRecipeEnum, UnitEnum, Category, RecipeFavorite, RecipeRating, Comment
from api.utils import generate_sitemap, APIException,  val_email, val_password
from flask_cors import CORS
import os
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta, datetime, timezone
from functools import wraps
import json
from .cloudinary_service import cloudinary_service
from sqlalchemy import select, func
from .admin_decorator import admin_required
import cloudinary
import cloudinary.uploader
from datetime import datetime, timezone
import requests
from .unit_converter import converter


api = Blueprint('api', __name__)


# Allow CORS requests to this API
CORS(api)


@api.route("/health-check", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"}), 200


@api.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def getUser(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 401

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
        if existing_email_user and existing_email_user.id_user != user.id_user:
            return jsonify({"message": "This email is already registered"}), 400

        user.email = email

    if username:
        # Verificar si ya existe el username
        existing_username_user = User.query.filter_by(
            username=username).first()
        if existing_username_user and existing_username_user.id != current_user_id:
            return jsonify({"message": "This username is already in use"}), 400

        user.username = username

    if fullname:
        user.fullname = fullname

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

    rol = "usuario"
    if email == "eylinsmc@gmail.com":
        rol = "admin"

    new_user = User(
        email=email,
        password=hashed_password,
        fullname=fullname,
        username=username,
        salt=salt,
        rol=rol,
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
    categories = Category.query.order_by(Category.id_category).all() 
    data = [category.serialize() for category in categories]
    return jsonify(data), 200


@api.route("/categories", methods=["POST"])
@jwt_required()
def create_category():
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"message": "Admin rol requerido"}), 403
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Data no proveida"}), 400

    name_category = data.get("name_category")

    if not name_category or not name_category.strip():
        return jsonify({"message": "Nombre de categoría es requerido"}), 400

    name_category = name_category.strip()

    existing_category = Category.query.filter_by(
        name_category=name_category
    ).first()

    if existing_category:
        return jsonify({"message": "Categoría ya existe"}), 409

    new_category = Category(
        name_category=name_category,

    )

    db.session.add(new_category)

    try:
        db.session.commit()
        return jsonify({
            "message": "Categoría creada exitosamente",
            "category": new_category.serialize()
        }), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error creando categoría",
            "error": f"{error.args}"
        }), 500


@api.route("/categories/<int:id>", methods=["PUT"])
@jwt_required()
def edit_category(id):
    claims = get_jwt()
    if claims.get("rol") != "admin":
        return jsonify({"message": "Admin rol requerido"}), 403
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"message": "Data no proveida"}), 400
    new_name = data.get("name_category")

    if not new_name or not new_name.strip():
        return jsonify({"message": "Nombre de categoría no puede estar vacío"}), 400
    new_name = new_name.strip()

    category = Category.query.get(id)

    if category is None:
        return jsonify({"message": "Categoría no encontrada"}), 404

    if new_name != category.name_category:
        existing = Category.query.filter_by(name_category=new_name).first()
        if existing:
            return jsonify({"message": "Nombre de categoría ya existe"}), 409

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
    if claims.get("rol") != "admin":
        return jsonify({"message": "Admin rol requerido"}), 403

    category = Category.query.get(id)
    if category is None:
        return jsonify({"message": "Categoría no encontrada"}), 404
    recipes_count = Recipe.query.filter_by(
        category_id=category.id_category).count()

    if recipes_count > 0:
        return jsonify({
            "message": "Categoría no puede ser eliminada porque tiene recetas relacionadas",
            "recipes_count": recipes_count
        }), 400

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({
            "message": "Categoría eliminada exitosamente",
        }), 200
    except Exception as error:
        db.session.rollback()
        print("error al eliminar", repr(error))
        return jsonify({
            "message": "Error eliminando categoría",
            "error": str(error)
        }), 500


@api.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "JSON inválido"}), 400
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Actual y nueva contraseña son requeridas"}), 400

    # Verificar que la contraseña actual sea correcta
    is_valid = check_password_hash(
        user.password, f"{current_password}{user.salt}")
    if not is_valid:
        return jsonify({"message": "Contraseña actual incorrecta"}), 401

    # validar nueva contraseña
    from api.utils import val_password
    if not val_password(new_password):
        return jsonify({"message": "Nueva contraseña no cumple con los requisitos"}), 400

    # generar nuevo salt
    import secrets
    new_salt = secrets.token_hex(16)

    # hashear con nuevo salt
    new_hashed_password = generate_password_hash(f"{new_password}{new_salt}")

    user.password = new_hashed_password
    user.salt = new_salt
    db.session.commit()

    # generar nuevo token
    from flask_jwt_extended import create_access_token
    additional_claims = {"rol": user.rol}
    new_token = create_access_token(identity=str(
        user.id_user), additional_claims=additional_claims)

    return jsonify({
        "message": "Contraseña actualizada exitosamente",
        "token": new_token,
        "user": user.serialize()
    }), 200


@api.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username").strip()
    password = data.get("password").strip()

    if not username or not password:
        return jsonify({"message": "Usuario y contraseña son requeridos"}), 400
    user = User.query.filter_by(username=username).one_or_none()
    if user is None:
        return jsonify({"message": "Usuario inválido"}), 401
    if not check_password_hash(user.password, f"{password}{user.salt}"):
        return jsonify({"message": "Credenciales inválidas"}), 401

    # Para bloquear el acceso si no está activo el usuario.
    if not user.is_active:
        return jsonify({"message": "Su cuenta está inhabilitada. Contacte al administrador."}), 403

    # if not user.profile:
    #     print("➡ NO TIENE PROFLE, GENERANDO AVATAR...")
    #     initials = get_initials(user.fullname)
    #     print("Iniciales detectadas:", initials)
    #     user.profile = generate_initials_image(initials)
    #     print("Avatar generado:", user.profile)
        # db.session.commit()

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

        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 9))

        offset = (page - 1) * limit

        base_query = db.select(Recipe).filter(
            Recipe.state_recipe == status_filter)

        total_query = db.select(db.func.count()).select_from(base_query)
        total_count = db.session.execute(total_query).scalar()

        recipes_query = (
            base_query
            .order_by(Recipe.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        recipes = db.session.execute(recipes_query).scalars().all()
        response_body = [recipe.serialize() for recipe in recipes]

        return jsonify({
            "message": f"List of successfully {status_param} recipes for Admin (Page {page})",
            "recipes": response_body,
            "total_count": total_count
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

    if not is_admin:
        if recipe.user_id != user_id:
            return jsonify({"message": "Not authorized"}), 403
        if recipe.state_recipe == stateRecipeEnum.PUBLISHED:
            return jsonify({"message": "Cannot edit published recipes"}), 403

        if recipe.state_recipe == stateRecipeEnum.REJECTED:
            recipe.state_recipe = stateRecipeEnum.PENDING
            print(f"Receta {recipe_id} reenviada a revisión automáticamente.")

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
                    name=ingredient_name,
                    calories_per_100=0.0,
                    protein_per_100=0.0,
                    carbs_per_100=0.0,
                    fat_per_100=0.0
                )
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

        return jsonify({
            "message": "Recipe updated successfully.",
            "recipe": recipe.serialize(),
            "new_status": recipe.state_recipe.value
        }), 200

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


@api.route("/recetas/<int:recipe_id>", methods=["GET"])
@jwt_required(optional=True)
def get_recipe_detail(recipe_id):
    try:
        current_user_id = get_jwt_identity()
        if current_user_id is not None:
            try:
                current_user_id = int(current_user_id)
            except ValueError:
                current_user_id = None

        recipe = Recipe.query.filter_by(
            id_recipe=recipe_id
            # state_recipe=stateRecipeEnum.PUBLISHED
        ).first()

        if recipe is None:
            return jsonify({"message": "Recipe Not Found"}), 404

        recipe_data = recipe.serialize()

        if 'nutritional_data' in recipe_data and isinstance(recipe_data['nutritional_data'], str):
            try:
                recipe_data['nutritional_data'] = json.loads(
                    recipe_data['nutritional_data'])
            except json.JSONDecodeError as e:
                print(f"Error al decodificar nutritional_data: {e}")
                recipe_data['nutritional_data'] = None

        user_rating = None
        user_rating_object = None
        is_favorite = False

        if current_user_id is not None:
            fav = RecipeFavorite.query.filter_by(
                user_id=current_user_id,
                recipe_id=recipe.id_recipe
            ).first()
            is_favorite = fav is not None

        if current_user_id is not None:
            user_rating_object = RecipeRating.query.filter_by(
                user_id=current_user_id,
                recipe_id=recipe.id_recipe
            ).first()

            if user_rating_object:
                user_rating = user_rating_object.value

        is_published = recipe.state_recipe == stateRecipeEnum.PUBLISHED

        if is_published:
            ratings = recipe.ratings
            comments = [r.serialize() for r in ratings if r.comment]
            avg_rating = recipe.avg_rating
            vote_count = recipe.vote_count
        else:
            comments = []
            avg_rating = None
            vote_count = 0

        if not is_published:
            recipe_data['nutritional_data'] = None

        recipe_data.update({
            "avg_rating": avg_rating,
            "vote_count": vote_count,
            "user_rating": user_rating,
            "comments": comments,
            "is_favorite": is_favorite,
            "is_published": is_published
        })

        recipe_data['conversion_applied'] = 'original'
        return jsonify(recipe_data), 200

    except Exception as error:
        print("Error en get_recipe_detail:", e)
        return jsonify({
            "message": "Internal error retrieving recipe details",
            "details": str(error)
        }), 500


@api.route("/recetas/<int:recipe_id>/favorito", methods=["POST"])
@jwt_required()
def toggle_favorite(recipe_id):
    current_user_id = get_jwt_identity()
    try:
        current_user_id = int(current_user_id)
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid user identity"}), 401

    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return jsonify({"message": "Receta no encontrada o no disponible"}), 404

    try:
        favorite = RecipeFavorite.query.filter_by(
            user_id=current_user_id,
            recipe_id=recipe_id
        ).first()

        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({
                "message": "Receta eliminada de favoritos",
                "is_favorite": False
            }), 200
        else:
            new_favorite = RecipeFavorite(
                user_id=current_user_id,
                recipe_id=recipe_id
            )
            db.session.add(new_favorite)
            db.session.commit()
            return jsonify({
                "message": "Receta añadida a favoritos",
                "is_favorite": True
            }), 201

    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error al actualizar favorito",
            "details": str(error)
        }), 500


@api.route("/favoritos", methods=["GET"])
@jwt_required()
def get_user_favorites():
    try:
        current_user_id = get_jwt_identity()
        try:
            current_user_id = int(current_user_id)
        except (TypeError, ValueError):
            return jsonify({"message": "Invalid user identity"}), 401

        favorites = (
            db.session.query(RecipeFavorite)
            .join(Recipe, RecipeFavorite.recipe_id == Recipe.id_recipe)
            .filter(
                RecipeFavorite.user_id == current_user_id,
                Recipe.state_recipe == stateRecipeEnum.PUBLISHED
            )
            .all()
        )

        favorite_recipes = [
            fav.recipe.serialize() for fav in favorites
        ]

        return jsonify({
            "favorites": favorite_recipes,
            "count": len(favorite_recipes)
        }), 200

    except Exception as e:
        print("Error en get_user_favorites:", e)
        return jsonify({
            "message": "Error interno al obtener los favoritos",
            "details": str(e)
        }), 500


#ENDPOINT FAVORITOS Y RATING

@api.route("/recipes/top-rated", methods=["GET"])
@jwt_required(optional=True)
def get_top_rated_recipes():
    """
    Devuelve recetas mejor valoradas (con al menos 3 votos y rating >= 4.0)
    Si hay usuario autenticado, también incluye sus favoritos aunque no cumplan el criterio
    """
    try:
        current_user_id = get_jwt_identity()
        if current_user_id is not None:
            try:
                current_user_id = int(current_user_id)
            except (TypeError, ValueError):
                current_user_id = None

        top_rated = (
            db.session.query(Recipe)
            .filter(
                Recipe.state_recipe == stateRecipeEnum.PUBLISHED,
                Recipe.vote_count >= 3,
                Recipe.avg_rating >= 4.0
            )
            .order_by(Recipe.avg_rating.desc(), Recipe.vote_count.desc())
            .limit(50)
            .all()
        )

        recipe_ids_set = {recipe.id_recipe for recipe in top_rated}
        
        if current_user_id:
            user_favorites = (
                db.session.query(Recipe)
                .join(RecipeFavorite, RecipeFavorite.recipe_id == Recipe.id_recipe)
                .filter(
                    RecipeFavorite.user_id == current_user_id,
                    Recipe.state_recipe == stateRecipeEnum.PUBLISHED,
                    Recipe.id_recipe.notin_(recipe_ids_set)
                )
                .all()
            )
            
            all_recipes = list(top_rated) + list(user_favorites)
        else:
            all_recipes = top_rated

        recipes_data = []
        for recipe in all_recipes:
            meets_top_criteria = (
                recipe.vote_count is not None and 
                recipe.vote_count >= 3 and 
                recipe.avg_rating is not None and 
                recipe.avg_rating >= 4.0
            )
            
            recipe_dict = {
                "id": recipe.id_recipe,
                "title": recipe.title,
                "image": recipe.image,
                "portions": recipe.portions,
                "prep_time_min": recipe.preparation_time_min,
                "difficulty": recipe.difficulty.value,
                "avg_rating": recipe.avg_rating,
                "vote_count": recipe.vote_count,
                "is_favorite": False,
                "is_top_rated": meets_top_criteria
            }
            
            if current_user_id:
                is_fav = RecipeFavorite.query.filter_by(
                    user_id=current_user_id,
                    recipe_id=recipe.id_recipe
                ).first()
                recipe_dict["is_favorite"] = is_fav is not None
            
            recipes_data.append(recipe_dict)

        return jsonify({
            "message": "Top rated recipes retrieved successfully",
            "recipes": recipes_data,
            "count": len(recipes_data)
        }), 200

    except Exception as error:
        print("Error en get_top_rated_recipes:", error)
        return jsonify({
            "message": "Error interno al obtener recetas mejor valoradas",
            "details": str(error)
        }), 500

#endpoint Calidicacion recetas

@api.route("/recetas/<int:recipe_id>/calificar", methods=["POST"])
@jwt_required()
def rate_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    try:
        current_user_id = int(current_user_id)
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid user identity"}), 401

    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return jsonify({"message": "Receta no encontrada o no disponible"}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "JSON inválido o no enviado"}), 400

    value = data.get("value")
    comment = data.get("comment")

    try:
        value = int(value)
    except (TypeError, ValueError):
        return jsonify({"message": "La calificación debe ser un número entero"}), 400

    if value < 1 or value > 5:
        return jsonify({"message": "La calificación debe estar entre 1 y 5"}), 400

    try:
        rating = RecipeRating.query.filter_by(
            user_id=current_user_id,
            recipe_id=recipe_id
        ).first()

        if rating:
            rating.value = value
            rating.comment = comment
            rating.updated_at = datetime.now(timezone.utc)
        else:
            rating = RecipeRating(
                value=value,
                comment=comment,
                user_id=current_user_id,
                recipe_id=recipe_id
            )
            db.session.add(rating)

        db.session.commit()

        all_ratings = RecipeRating.query.filter_by(recipe_id=recipe_id).all()
        if all_ratings:
            total_votes = len(all_ratings)
            avg = sum(r.value for r in all_ratings) / total_votes
        else:
            total_votes = 0
            avg = None

        recipe.avg_rating = avg
        recipe.vote_count = total_votes
        db.session.commit()

        return jsonify({
            "message": "Calificación registrada correctamente",
            "rating": rating.serialize(),
            "avg_rating": avg,
            "vote_count": total_votes
        }), 201

    except Exception as error:
        db.session.rollback()
        return jsonify({
            "message": "Error al registrar la calificación",
            "details": str(error)
        }), 500


@api.route("/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_recipe(recipe_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("rol") == "admin"

    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None:
        return jsonify({"message": f"Recipe with ID {recipe_id} not found."}), 404

    if not is_admin:
        if recipe.user_id != user_id:
            return jsonify({"message": "Access denied. You can only delete your own recipes."}), 403

        if recipe.state_recipe == stateRecipeEnum.PUBLISHED:
            return jsonify({"message": "Access denied. Only administrators can delete published recipes."}), 403

    try:
        cloudinary_service.delete_image(recipe.image)
    except Exception as image_error:
        print(
            f"Error al eliminar imagen de Cloudinary para Receta ID {recipe_id}: {str(image_error)}")
        pass

    try:
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({"message": f"Recipe with ID {recipe_id} deleted successfully."}), 200

    except Exception as db_error:
        db.session.rollback()
        return jsonify({"message": "Error deleting recipe. Check DB logs for constraints.", "details": str(db_error)}), 500


@api.route("/admin/recipes/<int:recipe_id>/status", methods=["PUT"])
@admin_required()
def update_recipe_status(recipe_id):
    try:
        data = request.json
        new_status_param = data.get('new_status')

        if not new_status_param:
            return jsonify({"message": "Falta el parámetro 'new_status'."}), 400

        status_map = {
            "published": stateRecipeEnum.PUBLISHED,
            "rejected": stateRecipeEnum.REJECTED,
            "pending": stateRecipeEnum.PENDING
        }

        if new_status_param not in status_map:
            return jsonify({"message": "Estado no válido."}), 400

        recipe = db.session.get(Recipe, recipe_id)
        if recipe is None:
            return jsonify({"message": "Receta no encontrada."}), 404

        recipe.state_recipe = status_map[new_status_param]
        db.session.commit()

        return jsonify({"message": f"Estado de receta {recipe_id} actualizado a {new_status_param}."}), 200

    except Exception as error:
        print(f"Error al actualizar el estado de la receta: {error}")
        db.session.rollback()
        return jsonify({"message": "Error interno del servidor.", "Details": str(error)}), 500


@api.route("/admin/recipes/counts", methods=["GET"])
@admin_required()
def get_admin_recipe_counts():
    try:
        counts_query = (
            db.select(Recipe.state_recipe, db.func.count())
            .group_by(Recipe.state_recipe)
        )

        results = db.session.execute(counts_query).all()
        counts = {
            "published": 0,
            "pending": 0,
            "rejected": 0,
        }

        for state_enum, count in results:
            counts[state_enum.value] = count

        return jsonify({
            "message": "Conteo de recetas por estado exitoso",
            "counts": counts
        }), 200

    except Exception as error:
        print(f"Error al obtener conteos de recetas: {error}")
        return jsonify({
            "message": "Error interno del servidor al obtener conteos.",
            "Details": str(error)
        }), 500


@api.route("/upload-profile-image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    image = request.files.get("image")
    if not image:
        return jsonify({"message": "No image provided"}), 400

    upload_result = cloudinary.uploader.upload(
        image,
        folder="profiles",
        public_id=str(user_id),
        overwrite=True
    )

    user.profile = upload_result["secure_url"]
    db.session.commit()

    return jsonify({
        "image": user.profile,
        "user": user.serialize()
    }), 200


@api.route("/recipes/<int:recipe_id>/comments", methods=["GET"])
def get_recipe_comments(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return jsonify({"message": "Receta no encontrada"}), 404

    comments = Comment.query.filter_by(recipe_id=recipe_id).order_by(
        Comment.created_at.desc()).all()
    return jsonify([comment.serialize() for comment in comments]), 200


@api.route("/recipes/<int:recipe_id>/comments", methods=["POST"])
@jwt_required()
def create_comment(recipe_id):
    current_user_id = int(get_jwt_identity())

    recipe = Recipe.query.get(recipe_id)
    if not recipe or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return jsonify({"message": "Receta no encontrada"}), 404

    data = request.get_json()
    content = data.get("content", "").strip()

    if not content:
        return jsonify({"message": "El comentario no puede estar vacío"}), 400

    new_comment = Comment(
        content=content,
        user_id=current_user_id,
        recipe_id=recipe_id
    )

    db.session.add(new_comment)
    try:
        db.session.commit()
        return jsonify({
            "message": "Comentario creado",
            "comment": new_comment.serialize()
        }), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error al crear comentario", "details": str(error)}), 500


@api.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    update_data = request.get_json()
    updated_text = update_data.get("content", "").strip()

    if not updated_text:
        return jsonify({"error": "El comentario no puede estar vacío."}), 400

    user_id = int(get_jwt_identity())

    existing_comment = Comment.query.get(comment_id)
    if not existing_comment:
        return jsonify({"error": "Comentario no encontrado."}), 404

    if existing_comment.user_id != user_id:
        return jsonify({"error": "No tienes permiso para editar este comentario."}), 403

    existing_comment.content = updated_text
    db.session.commit()

    return jsonify({
        "message": "Comentario actualizado",
        "comment": existing_comment.serialize()
    }), 200


@api.route("/comments/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    is_admin = claims.get("rol") == "admin"

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "Comentario no encontrado"}), 404

    if comment.user_id != current_user_id and not is_admin:
        return jsonify({"message": "No autorizado"}), 403

    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"message": "Comentario eliminado"}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Error al eliminar comentario", "details": str(error)}), 500

# RUTAS PARA HOME Y CATEGORÍAS


@api.route("/recipes/resumen", methods=["GET"])
@jwt_required(optional=True)
def get_recipes_summary():
    """
    Devuelve un resumen con todas las categorías y 12 recetas publicadas por categoría
    para los carruseles del home. Incluye información de favoritos si hay usuario logueado.
    """
    try:
        current_user_id = get_jwt_identity()
        if current_user_id is not None:
            try:
                current_user_id = int(current_user_id)
            except (TypeError, ValueError):
                current_user_id = None

        categories = Category.query.order_by(Category.id_category).all()

        summary = {}

        for category in categories:
            recipes = (
                db.session.query(Recipe)
                .filter(
                    Recipe.category_id == category.id_category,
                    Recipe.state_recipe == stateRecipeEnum.PUBLISHED
                )
                .order_by(Recipe.created_at.desc())
                .limit(12)
                .all()
            )

            if recipes:
                recipes_data = []
                for recipe in recipes:
                    meets_top_criteria = (
                        recipe.vote_count is not None and 
                        recipe.vote_count >= 3 and 
                        recipe.avg_rating is not None and 
                        recipe.avg_rating >= 4.0
                    )
                    
                    recipe_dict = {
                        "id": recipe.id_recipe,
                        "title": recipe.title,
                        "image": recipe.image,
                        "portions": recipe.portions,
                        "prep_time_min": recipe.preparation_time_min,
                        "difficulty": recipe.difficulty.value,
                        "is_top_rated": meets_top_criteria,
                        "is_favorite": False
                    }
                    
                    if current_user_id:
                        is_fav = RecipeFavorite.query.filter_by(
                            user_id=current_user_id,
                            recipe_id=recipe.id_recipe
                        ).first()
                        recipe_dict["is_favorite"] = is_fav is not None
                    
                    recipes_data.append(recipe_dict)
                
                summary[category.name_category] = {
                    "category_id": category.id_category,
                    "category_name": category.name_category,
                    "recipes": recipes_data
                }

        return jsonify({
            "message": "Recipe summary retrieved successfully",
            "categories": summary
        }), 200

    except Exception as error:
        print(f"Error getting recipe summary: {error}")
        return jsonify({
            "message": "Error retrieving recipe summary",
            "details": str(error)
        }), 500

@api.route("/recipes/category/<int:category_id>", methods=["GET"])
def get_recipes_by_category(category_id):
    """
    Devuelve recetas de una categoría específica con paginación
    Query params: page (default 1), per_page (default 12)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Verificar que la categoría existe
        category = Category.query.get(category_id)
        if not category:
            return jsonify({"message": "Categoría no encontrada"}), 404

        # Query con paginación
        pagination = (
            db.session.query(Recipe)
            .filter(
                Recipe.category_id == category_id,
                Recipe.state_recipe == stateRecipeEnum.PUBLISHED
            )
            .order_by(Recipe.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        recipes_list = [
            {
                "id": recipe.id_recipe,
                "title": recipe.title,
                "image": recipe.image,
                "portions": recipe.portions,
                "prep_time_min": recipe.preparation_time_min,
                "difficulty": recipe.difficulty.value,
                "avg_rating": recipe.avg_rating,
                "vote_count": recipe.vote_count
            }
            for recipe in pagination.items
        ]

        return jsonify({
            "message": "Recipes retrieved successfully",
            "category_name": category.name_category,
            "recipes": recipes_list,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as error:
        logger.error(f"Error getting recipes by category: {error}")
        return jsonify({
            "message": "Error retrieving recipes",
            "details": str(error)
        }), 500

# ENDPOINT DE BÚSQUEDA DE RECETAS
# Permite buscar recetas por título para el componente SearchResults


@api.route("/recipes/search", methods=["GET"])
def search_recipes():
    """
    Busca recetas por título
    Query param: q (término de búsqueda)
    """
    try:
        query = request.args.get('q', '').strip()

        if not query or len(query) < 2:
            return jsonify({
                "message": "Search term must be at least 2 characters",
                "recipes": []
            }), 400

        # Buscar recetas publicadas que coincidan con el término
        recipes = (
            db.session.query(Recipe)
            .filter(
                Recipe.title.ilike(f'%{query}%'),
                Recipe.state_recipe == stateRecipeEnum.PUBLISHED
            )
            .order_by(Recipe.created_at.desc())
            .limit(50)
            .all()
        )

        recipes_list = [
            {
                "id": recipe.id_recipe,
                "title": recipe.title,
                "image": recipe.image,
                "portions": recipe.portions,
                "prep_time_min": recipe.preparation_time_min,
                "difficulty": recipe.difficulty.value,
                "avg_rating": recipe.avg_rating,
                "vote_count": recipe.vote_count
            }
            for recipe in recipes
        ]

        return jsonify({
            "message": "Search completed successfully",
            "recipes": recipes_list,
            "total": len(recipes_list)
        }), 200

    except Exception as error:
        print(f"Error searching recipes: {error}")
        return jsonify({
            "message": "Error performing search",
            "details": str(error),
            "recipes": []
        }), 500


@api.route("/admin/users", methods=["GET"])
@admin_required()
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)
    try:
        query = db.select(User).order_by(User.created_at.desc())
        pagination = db.paginate(
            query, page=page, per_page=per_page, error_out=False)
        user_list = [user.serialize() for user in pagination.items]

        return jsonify({
            "users": user_list,
            "total_users": pagination.total,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }), 200

    except Exception as error:
        print(f"Error al obtener usuarios: {error}")
        return jsonify({"message": "Server error fetching users.", "Details": str(error)}), 500


@api.route("/admin/user/role/<int:user_id>", methods=["PUT"])
@admin_required()
def update_user_role(user_id):
    data = request.get_json()
    new_role = data.get("rol")

    if new_role not in ["admin", "usuario"]:
        return jsonify({"message": "Invalid role value."}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    try:
        user.rol = new_role
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({"message": f"Role for user {user.username} updated to {new_role}."}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Database error while updating role.", "Details": str(error)}), 500


@api.route("/admin/user/change-active/<int:user_id>", methods=["PUT"])
@admin_required()
def change_user_active(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    try:
        user.is_active = not user.is_active
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        # se hizo esto para usar en el mensaje del estatus a activo o inactivo, solo par ainformar
        if user.is_active:
            status = "Active"
        else:
            status = "Inactive"
        return jsonify({"message": f"User {user.username} status changed to {status}."}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Database error while toggling status.", "Details": str(error)}), 500


@api.route("/admin/user/<int:user_id>", methods=["DELETE"])
@admin_required()
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User {user.username} deleted successfully."}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"message": "Database error while deleting user.", "Details": str(error)}), 500


@api.route("/my-recipes", methods=["GET"])
@jwt_required()
def get_my_recipes():
    try:
        current_user_id = get_jwt_identity()
        status_param = request.args.get('status')
        base_query = db.select(Recipe).filter(
            Recipe.user_id == current_user_id)

        if status_param == "pending":
            base_query = base_query.filter(
                Recipe.state_recipe == stateRecipeEnum.PENDING)
        elif status_param == "published":
            base_query = base_query.filter(
                Recipe.state_recipe == stateRecipeEnum.PUBLISHED)
        elif status_param == "rejected":
            base_query = base_query.filter(
                Recipe.state_recipe == stateRecipeEnum.REJECTED)

        page = int(request.args.get('page', 1, type=int))
        limit = int(request.args.get('limit', 9, type=int))
        offset = (page - 1) * limit

        total_query = db.select(db.func.count()).select_from(base_query)
        total_count = db.session.execute(total_query).scalar()

        recipes_query = (
            base_query
            .order_by(Recipe.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        recipes = db.session.execute(recipes_query).scalars().all()
        response_body = [recipe.serialize() for recipe in recipes]

        return jsonify({
            "message": "User recipes fetched successfully",
            "recipes": response_body,
            "total_count": total_count
        }), 200

    except Exception as error:
        print(f"Error fetching user recipes: {error}")
        return jsonify({"message": "Internal Server Error"}), 500


@api.route("/recipe/<int:recipe_id>/rate", methods=["POST"])
@jwt_required()
def rate_recipes(recipe_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    rating_value = data.get("rating")

    if rating_value is None or not 1 <= rating_value <= 5:
        return jsonify({"message": "The grade must be a whole number between 1 and 5."}), 400

    recipe = db.session.get(Recipe, recipe_id)
    if recipe is None or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return jsonify({"message": "Recipe not found or not published."}), 404

    existing_rating = RecipeRating.query.filter_by(
        user_id=user_id,
        recipe_id=recipe_id
    ).one_or_none()

    if existing_rating:
        old_value = existing_rating.value
        existing_rating.value = rating_value
        action_msg = "Rating successfully updated."
        db.session.add(existing_rating)
    else:
        new_rating = RecipeRating(
            user_id=user_id,
            recipe_id=recipe_id,
            value=rating_value,
        )
        db.session.add(new_rating)
        action_msg = "Recipe successfully rated."

    rating_summary = db.session.query(
        func.sum(RecipeRating.value).label('total_sum'),
        func.count(RecipeRating.id_rating).label('total_count')
    ).filter(RecipeRating.recipe_id == recipe_id).first()

    total_sum = rating_summary.total_sum
    total_count = rating_summary.total_count

    recipe.vote_count = total_count

    if total_count > 0:
        recipe.avg_rating = total_sum / total_count
    else:
        recipe.avg_rating = None

    db.session.add(recipe)
    db.session.commit()

    return jsonify({"message": action_msg, "avg_rating": recipe.avg_rating, "vote_count": recipe.vote_count}), 200


CALORIAS_ID = 1008
PROTEIN_ID = 1003
FAT_ID = 1004
CARBS_ID = 1005


def get_nutrient_value(detail_data, nutrient_id):
    for nutrient in detail_data.get("foodNutrients", []):
        if str(nutrient.get("nutrient", {}).get("id")) == str(nutrient_id):
            return nutrient.get("amount", 0)
    return 0


def calculate_and_save_nutrition(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if recipe is None or recipe.state_recipe != stateRecipeEnum.PUBLISHED:
        return None
    total_nutrition = {
        "calories": 0.0,
        "protein": 0.0,
        "fat": 0.0,
        "carbs": 0.0
    }

    api_key = os.getenv("USDA_API_KEY")
    usda_search_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    usda_detail_base_url = "https://api.nal.usda.gov/fdc/v1/food/"

    if not api_key:
        print("Error: USDA_API_KEY not found.")
        return None

    for ri in recipe.recipe_ingredients_details:
        ingredient_name = ri.ingredient_catalog.name if ri.ingredient_catalog else "unknown ingredient"

        params = {
            "api_key": api_key,
            "query": ingredient_name,
            "pageSize": 1
        }

        try:
            response = requests.get(usda_search_url, params=params)
            response.raise_for_status()
            search_data = response.json()

            if search_data.get("foods"):
                best_match = search_data["foods"][0]
                fdc_id_found = best_match["fdcId"]

                detail_url = f"{usda_detail_base_url}{fdc_id_found}"
                detail_params = {"api_key": api_key}

                detail_response = requests.get(
                    detail_url, params=detail_params)
                detail_response.raise_for_status()
                detail_data = detail_response.json()

                calories_per_100 = get_nutrient_value(detail_data, CALORIAS_ID)
                protein_per_100 = get_nutrient_value(detail_data, PROTEIN_ID)
                fat_per_100 = get_nutrient_value(detail_data, FAT_ID)
                carbs_per_100 = get_nutrient_value(detail_data, CARBS_ID)

                quantity_factor = ri.quantity / 100.0 if ri.quantity else 0.0

                total_nutrition["calories"] += calories_per_100 * \
                    quantity_factor
                total_nutrition["protein"] += protein_per_100 * quantity_factor
                total_nutrition["fat"] += fat_per_100 * quantity_factor
                total_nutrition["carbs"] += carbs_per_100 * quantity_factor

        except requests.exceptions.RequestException as error:
            print(f"Error de API para {ingredient_name}: {str(error)}")
            continue

    final_nutrition_data = {"total_nutrition": {
        k: round(v, 2) for k, v in total_nutrition.items()}, }

    try:
        json_to_save = json.dumps(final_nutrition_data)
        recipe.nutritional_data = json_to_save
        db.session.add(recipe)
        db.session.commit()
        return final_nutrition_data["total_nutrition"]
    except Exception as db_error:
        db.session.rollback()
        print(f"Error al guardar en BD: {db_error}")
        return None


@api.route("/recetas/<int:recipe_id>/nutricional", methods=["GET"])
@jwt_required(optional=True)
def get_recipe_nutrition(recipe_id):
    try:
        recipe = Recipe.query.filter_by(id_recipe=recipe_id).first()
        if recipe is None:
            return jsonify({"message": "Recipe not found"}), 404

        if recipe.nutritional_data:
            data = json.loads(recipe.nutritional_data)
            return jsonify(data), 200

        calculated_data = calculate_and_save_nutrition(recipe_id)

        if calculated_data:
            db.session.refresh(recipe)
            data = json.loads(recipe.nutritional_data)
            return jsonify(data), 200
        else:
            return jsonify({"message": "Nutritional calculation failed or unavailable"}), 404

    except Exception as error:
        print("Error en get_recipe_nutrition:", error)
        return jsonify({"message": "Internal error in obtaining nutrition"}), 500


@api.route("/recetas/<int:recipe_id>/ingredientes", methods=["GET"])
def get_converted_ingredients(recipe_id):
    try:
        unit_to_convert = request.args.get("unit", None)
        if not unit_to_convert or unit_to_convert == "original":
            return jsonify({"message": "No conversion unit specified"}), 400
        recipe = Recipe.query.get(recipe_id)

        if recipe is None:
            return jsonify({"message": "Recipe Not Found"}), 404

        recipe_ingredients = [ri.serialize()
                              for ri in recipe.recipe_ingredients_details]

        converted_ingredients = []

        for ingredient_item in recipe_ingredients:
            ingredient_model = Ingredient.query.get(
                ingredient_item["ingredient_id"])

            original_unit = ingredient_item["unit_measure"]
            original_quantity = ingredient_item["quantity"]

            converted_quantity, final_unit = converter.convert_ingredient(
                quantity=original_quantity,
                unit_from=original_unit,
                unit_to=unit_to_convert,
                ingredient_model=ingredient_model
            )

            converted_item = ingredient_item.copy()
            converted_item['original_quantity'] = original_quantity
            converted_item['original_unit'] = original_unit
            converted_item['quantity'] = round(converted_quantity, 2)
            converted_item['unit_measure'] = final_unit
            converted_ingredients.append(converted_item)

        return jsonify(converted_ingredients), 200

    except Exception as e:
        print("Error en get_converted_ingredients:", e)
        return jsonify({
            "message": "Internal error retrieving converted ingredients",
            "details": str(e)
        }), 500

@api.route("/population", methods=["GET"])
def populate_database():
    json_path = os.path.join(
        os.path.dirname(__file__), "data_mock.json")

    if json_path:
        try:
            with open(json_path, "r", encoding="utf-8") as file:
                data = json.load(file)

            users = data.get("users", [])
            for user in users:
                salt = b64encode(os.urandom(16)).decode("utf-8")
                hashed_password = generate_password_hash(f"{user['password']}{salt}")
                email = user.get("email")
                fullname = user.get("fullname")
                username = user.get("username")
                rol = user.get("rol", "usuario")
                new_user = User(
                    email=email,
                    password=hashed_password,
                    fullname=fullname,
                    username=username,
                    salt=salt,
                    rol=rol,
                )
                db.session.add(new_user)
            db.session.commit()

            for category in data.get("categories", []):
                new_category = Category(
                    name_category=category.get("name_category")
                )
                print(new_category)
                db.session.add(new_category)
            db.session.commit()

            for recipe in data.get("recipes", []):
                new_recipe = Recipe(
                    title=recipe.get("title"),
                    steps=recipe.get("steps"),
                    image=recipe.get("image"),
                    difficulty=recipe.get("difficulty"),
                    preparation_time_min=recipe.get("prep_time"),
                    portions=recipe.get("portions"),
                    state_recipe=stateRecipeEnum.PUBLISHED,
                    user_id=recipe.get("user_id"),
                    category_id=recipe.get("category_id")
                )
                db.session.add(new_recipe)
            db.session.commit()
            
            return jsonify({"message": "Database populated successfully."}), 200

        except Exception as error:
            db.session.rollback()
            print(f"Error en la populación: {error.args}" )
            return jsonify({"message": "Error populating database.", "details": str(error)}), 500
