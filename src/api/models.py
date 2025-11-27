from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Boolean, DateTime, Text, Enum, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from datetime import datetime, timezone
from typing import Optional
import enum

db = SQLAlchemy()


class User(db.Model):
    id_user: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    fullname: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rol: Mapped[str] = mapped_column(
        String(20), nullable=False, default="usuario")
    created_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    salt: Mapped[str] = mapped_column(String(50), nullable=False)
    profile: Mapped[str] = mapped_column(String(
        255), nullable=True, default=None)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=True, default=True)

    recipe_user: Mapped[List["Recipe"]] = relationship(
        back_populates="user_recipe",
        cascade="all, delete-orphan"
    )
    recipe_ratings: Mapped[List["RecipeRating"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")
    favorites: Mapped[List["RecipeFavorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'

    def serialize(self):
        return {
            "id": self.id_user,
            "username": self.username,
            "email": self.email,
            "fullname": self.fullname,
            "rol": self.rol,
            "is_Active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "image": self.profile or f"https://ui-avatars.com/api/?name={self.username}&size=128&background=random&rounded=true"
        }

# Empieza código de categoría


class Category(db.Model):
    __tablename__ = "categories"

    id_category: Mapped[int] = mapped_column(primary_key=True)
    name_category: Mapped[str] = mapped_column(
        String(55), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    recipe_category: Mapped[List["Recipe"]] = relationship(
        back_populates="category_recipe")

    def __repr__(self):
        return f'<Category {self.name_category}>'

    def serialize(self):
        return {
            "id": self.id_category,
            "name_category": self.name_category,
        }

 
class difficultyEnum(enum.Enum):
    EASY = "fácil"
    MEDIUM = "medio"
    DIFFICULT = "difícil"


class stateRecipeEnum(enum.Enum):
    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"


class UnitEnum(enum.Enum):
    KILOGRAMS = "kg"
    GRAMS = "g"
    POUNDS = "lb"
    OUNCES = "oz"
    LITERS = "l"
    MILLILITERS = "ml"
    CUPS = "tazas"
    TABLESPOONS = "cucharadas_sopera"
    TEASPOONS = "cucharaditas"
    UNITS = "unidades"
    PINCH = "pizca"


class Recipe(db.Model):
    id_recipe: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(
        String(125), unique=True, nullable=False)
    steps: Mapped[str] = mapped_column(Text, nullable=False)
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(
        Enum(difficultyEnum), nullable=False)
    preparation_time_min: Mapped[int] = mapped_column(Integer, nullable=False)
    portions: Mapped[int] = mapped_column(Integer, nullable=False)
    nutritional_data: Mapped[Optional[str]
                             ] = mapped_column(Text, nullable=True)
    state_recipe: Mapped[str] = mapped_column(
        Enum(stateRecipeEnum), nullable=False, default="pending")
    avg_rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    vote_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user_id: Mapped[int] = mapped_column(
        db.ForeignKey('user.id_user', ondelete='CASCADE'),
        nullable=False
    )
    user_recipe: Mapped["User"] = relationship(back_populates="recipe_user")

    recipe_ingredients_details: Mapped[List["RecipeIngredient"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan")
    ratings: Mapped[List["RecipeRating"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan")
    favorites: Mapped[List["RecipeFavorite"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan")

    category_id: Mapped[int] = mapped_column(
        db.ForeignKey('categories.id_category'), nullable=False)
    category_recipe: Mapped["Category"] = relationship(
        back_populates="recipe_category")

    def __repr__(self):
        return f'<Recipe {self.title}>'

    def serialize(self):
        difficulty = (
            self.difficulty.value
            if isinstance(self.difficulty, enum.Enum)
            else self.difficulty
        )
        status = (
            self.state_recipe.value
            if isinstance(self.state_recipe, enum.Enum)
            else self.state_recipe
        )

        ingredients_list = [item.serialize() for item in self.recipe_ingredients_details]

        return {
            "id": self.id_recipe,
            "title": self.title,
            "steps": self.steps,
            "image": self.image,
            "prep_time_min": self.preparation_time_min,
            "difficulty": difficulty,
            "portions": self.portions,
            "status": status,
            "avg_rating": self.avg_rating,
            "vote_count": self.vote_count,
            "nutritional_data": self.nutritional_data,
            "creator_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category_recipe.name_category,
            "ingredients": ingredients_list,
            "created_at": self.created_at.isoformat(),
    }


# Clase ingrediente (el catálogo)

class Ingredient(db.Model):
    id_ingredient: Mapped[int] = mapped_column(primary_key=True)
    # es para el nombre, para que no haya dos ingredientes repetidos
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    # lo coloco por si nos da tiempo de hacer lo de las conversiones
    volume_to_mass_factor: Mapped[Optional[float]
                                  ] = mapped_column(Float, nullable=True)
    unit_to_mass_factor: Mapped[Optional[float]
                                ] = mapped_column(Float, nullable=True)
    # Para valores nutricionales por 100g/ml
    calories_per_100: Mapped[float] = mapped_column(
        Float, nullable=False, default=0)
    protein_per_100: Mapped[float] = mapped_column(
        Float, nullable=False, default=0)
    carbs_per_100: Mapped[float] = mapped_column(
        Float, nullable=False, default=0)
    fat_per_100: Mapped[float] = mapped_column(
        Float, nullable=False, default=0)

    recipe_ingredients_details: Mapped[List["RecipeIngredient"]] = relationship(
        back_populates="ingredient_catalog", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Ingredient {self.name}>'

    def serialize(self):
        return {
            "id": self.id_ingredient,
            "name": self.name,
            "volume_to_mass_factor": self.volume_to_mass_factor,
            "unit_to_mass_factor": self.unit_to_mass_factor,
            "calories_per_100": self.calories_per_100,
            "protein_per_100": self.protein_per_100,
            "carbs_per_100": self.carbs_per_100,
            "fat_per_100": self.fat_per_100,
        }


# Para presentar el detalle de la Receta - Una clase intermedia, de enlace entre las dos tablas, ingredientes y recetas

class RecipeIngredient(db.Model):
    id_recipe_ingredient: Mapped[int] = mapped_column(primary_key=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit_measure: Mapped[str] = mapped_column(Enum(UnitEnum), nullable=False)

    recipe_id: Mapped[int] = mapped_column(
        db.ForeignKey("recipe.id_recipe"), nullable=False)
    recipe: Mapped["Recipe"] = relationship(
        back_populates="recipe_ingredients_details")

    ingredient_catalog_id: Mapped[int] = mapped_column(
        db.ForeignKey("ingredient.id_ingredient"), nullable=False)
    ingredient_catalog: Mapped["Ingredient"] = relationship(
        back_populates="recipe_ingredients_details")

    def serialize(self):
        unit = (
            self.unit_measure.value
            if isinstance(self.unit_measure, enum.Enum)
            else self.unit_measure
        )
        return {
            "id": self.id_recipe_ingredient,
            "ingredient_id": self.ingredient_catalog_id,
            "name": self.ingredient_catalog.name,
            "quantity": self.quantity,
            "unit_measure": unit,
        }


class RecipeRating(db.Model):
    __tablename__ = "recipe_ratings"

    id_rating: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id_user"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="recipe_ratings")
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipe.id_recipe"), nullable=False)
    recipe: Mapped["Recipe"] = relationship(back_populates="ratings")

    def __repr__(self):
        return f"<RecipeRating recipe_id={self.recipe_id} user_id={self.user_id} value={self.value}>"

    def serialize(self):
        return {
            "id": self.id_rating,
            "value": self.value,
            "comment": self.comment,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "created_at": self.created_at.isoformat()
        }


class RecipeFavorite(db.Model):
    __tablename__ = "recipe_favorites"

    id_favorite: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id_user"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipe.id_recipe"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(
        timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship(back_populates="favorites")
    recipe: Mapped["Recipe"] = relationship(back_populates="favorites")

    def __repr__(self):
        return f"<RecipeFavorite user_id={self.user_id} recipe_id={self.recipe_id}>"
