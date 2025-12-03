"""
Seeder para crear usuarios de prueba.
- No duplica usuarios si ya existen (por username o email).
- Crea un administrador y varios usuarios "normales".

cd src   pipenv run python seed_users.py
"""

import os
import hashlib

from api.models import db, User
from app import app


# Lista de usuarios
USERS_DATA = [
    {
        "username": "cvmeneses",
        "email": "carlosocharly1@gmail.com",
        "fullname": "Carlos Meneses",
        "rol": "admin",
        "password_plain": "Admin123."
    },
    {
        "username": "carlos.garcia",
        "email": "carlos.garcia@example.com",
        "fullname": "Carlos García",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "maria.piedad",
        "email": "maria.piedad@example.com",
        "fullname": "María López",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "ana.morales",
        "email": "ana.morales@example.com",
        "fullname": "Ana Morales",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "jose.ramirez",
        "email": "jose.ramirez@example.com",
        "fullname": "José Ramírez",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "ana.delgado",
        "email": "ana.delgado@example.com",
        "fullname": "Ana Morales",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "jose.ramz",
        "email": "jose.ramz@example.com",
        "fullname": "José Ramírez",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "maria.lopez",
        "email": "maria.lopez@example.com",
        "fullname": "María López",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "carlos.perez",
        "email": "carlos.perez@example.com",
        "fullname": "Carlos Pérez",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "luisa.garcia",
        "email": "luisa.garcia@example.com",
        "fullname": "Luisa García",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "andres.sanchez",
        "email": "andres.sanchez@example.com",
        "fullname": "Andrés Sánchez",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "paola.mendoza",
        "email": "paola.mendoza@example.com",
        "fullname": "Paola Mendoza",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "diego.fernandez",
        "email": "diego.fernandez@example.com",
        "fullname": "Diego Fernández",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "sofia.alvarez",
        "email": "sofia.alvarez@example.com",
        "fullname": "Sofía Álvarez",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "ricardo.ortiz",
        "email": "ricardo.ortiz@example.com",
        "fullname": "Ricardo Ortiz",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "valeria.castro",
        "email": "valeria.castro@example.com",
        "fullname": "Valeria Castro",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "fernando.silva",
        "email": "fernando.silva@example.com",
        "fullname": "Fernando Silva",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "laura.rojas",
        "email": "laura.rojas@example.com",
        "fullname": "Laura Rojas",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "martin.guzman",
        "email": "martin.guzman@example.com",
        "fullname": "Martín Guzmán",
        "rol": "usuario",
        "password_plain": "Admin123."
    },
    {
        "username": "camila.vega",
        "email": "camila.vega@example.com",
        "fullname": "Camila Vega",
        "rol": "usuario",
        "password_plain": "Admin123."
    }
]


def hash_password(plain_password: str, salt: str) -> str:
    return hashlib.sha256(f"{plain_password}{salt}".encode("utf-8")).hexdigest()


def get_or_create_user(user_data: dict) -> User:
 
    existing = User.query.filter(
        (User.username == user_data["username"]) |
        (User.email == user_data["email"])
    ).first()

    if existing:
        print(f"Usuario ya existe, se mantiene: {existing.username}")
        return existing

    salt = os.urandom(16).hex()
    hashed_password = hash_password(user_data["password_plain"], salt)

    new_user = User(
        username=user_data["username"],
        email=user_data["email"],
        fullname=user_data.get("fullname"),
        rol=user_data.get("rol", "usuario"),
        password=hashed_password,
        salt=salt,
        is_active=True,
        profile=None,
    )
    db.session.add(new_user)
    db.session.flush()  

    print(f"Usuario creado: {new_user.username} (id={new_user.id_user}, rol={new_user.rol})")
    return new_user


def seed_users():
    with app.app_context():
        print("Iniciando seed de usuarios...")

        created_count = 0

        for data in USERS_DATA:
            before_count = User.query.count()
            _ = get_or_create_user(data)
            after_count = User.query.count()

            if after_count > before_count:
                created_count += 1

        db.session.commit()
        total_users = User.query.count()
        print(f"Seed terminado. Usuarios nuevos creados: {created_count}. Total en BD: {total_users}.")


if __name__ == "__main__":
    seed_users()
