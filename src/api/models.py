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
        255), nullable=False, default="https://ui-avatars.com/api/?name=User&size=128&background=random&rounded=true")
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=True, default=True)

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
            "image": self.profile
        }


# Empieza código de categoría

class Category(db.Model):
    __tablename__ = "categories"

    id_category: Mapped[int] = mapped_column(primary_key=True)
    name_category: Mapped[str] = mapped_column(String(55), unique=True, nullable=False)
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
        db.ForeignKey('user.id_user'), nullable=False)
    user_recipe: Mapped["User"] = relationship(back_populates="recipe_user")

    ingredient_recipe: Mapped[List["Ingredient"]] = relationship(
        back_populates="recipe_ingredient", cascade="all, delete-orphan")

    category_id: Mapped[int] = mapped_column(
        db.ForeignKey('categories.id_category'), nullable=False)
    category_recipe: Mapped["Category"] = relationship(
        back_populates="recipe_category")

    def __repr__(self):
        return f'<Recipe {self.title}>'

    def serialize(self):
        return {
            "id": self.id_recipe,
            "title": self.title,
            "steps": self.steps,
            "image": self.image,
            "prep_time_min": self.preparation_time_min,
            "difficulty": self.difficulty.value,
            "portions": self.portions,
            "status": self.state_recipe.value,
            "avg_rating": self.avg_rating,
            "vote_count": self.vote_count,
            "nutritional_data": self.nutritional_data,
            "creator_id": self.user_id,
            "category_id": self.category_id,
            "created_at": self.created_at.isoformat(),
        }


class Ingredient(db.Model):
    id_ingredient: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit_measure: Mapped[str] = mapped_column(Enum(UnitEnum), nullable=False)

    recipe_id: Mapped[int] = mapped_column(
        db.ForeignKey('recipe.id_recipe'), nullable=False)
    recipe_ingredient: Mapped["Recipe"] = relationship(
        back_populates="ingredient_recipe")

    density_id: Mapped[int] = mapped_column(
        db.ForeignKey('density.id'), nullable=False)
    density_ingredient: Mapped["Density"] = relationship(
        back_populates="ingredient_density")

    def __repr__(self):
        return f'<Ingredient {self.name} for Recipe ID: {self.recipe_id}>'

    def serialize(self):
        return {
            "id": self.id_ingredient,
            "name": self.name,
            "quantity": self.quantity,
            "unit_measure": self.unit_measure.value,
            "recipe_id": self.recipe_id,
            "density_id": self.density_id,
        }


class Density(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    base_name: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False)
    base_unit: Mapped[str] = mapped_column(String(10), nullable=False)
    volume_to_mass_factor: Mapped[Optional[float]
                                  ] = mapped_column(Float, nullable=True)
    unit_to_mass_factor: Mapped[Optional[float]
                                ] = mapped_column(Float, nullable=True)
    calories: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    protein: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    carbohydrates: Mapped[float] = mapped_column(
        Float, nullable=False, default=0)
    fat: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    ingredient_density: Mapped[List["Ingredient"]] = relationship(
        back_populates="density_ingredient")

    def __repr__(self):
        return f'<Density {self.base_name}>'

    def serialize(self):
        return {
            "id": self.id,
            "base_name": self.base_name,
            "base_unit": self.base_unit,
            "volume_to_mass_factor": self.volume_to_mass_factor,
            "unit_to_mass_factor": self.unit_to_mass_factor,
            "calories": self.calories,
            "protein": self.protein,
            "carbohydrates": self.carbohydrates,
            "fat": self.fat,
        }


