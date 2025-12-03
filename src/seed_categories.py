"""
Seeder para crear categorías de recetas en un orden 
- Crea las 12 categorías SOLO si la tabla está vacía
- Si ya existen categorías, NO hace nada

Ejecutar con:
    cd src
    pipenv run python seed_categories.py
"""

from api.models import db, Category
from app import app

# Orden de categorías
CATEGORIES_DATA = [
    # 1
    {"name_category": "Pastas Italianas"},          # 10 recetas
    # 2
    {"name_category": "Sopas y Cremas"},            # 12 recetas
    # 3
    {"name_category": "Ensaladas"},                 # 12 recetas
    # 4
    {"name_category": "Platos con Pollo"},          # 12 recetas
    # 5
    {"name_category": "Comida Mexicana"},           # 12 recetas
    # 6
    {"name_category": "Comida Asiática"},           # 12 recetas
    # 7
    {"name_category": "Mariscos y Pescados"},       # 11 recetas
    # 8
    {"name_category": "Carnes Rojas"},              # 11 recetas
    # 9
    {"name_category": "Comida Vegetariana"},        # 12 recetas
    # 10
    {"name_category": "Postres"},                   # 12 recetas
    # 11
    {"name_category": "Desayunos y Brunch"},        # 11 recetas
    # 12
    {"name_category": "Bocadillos y Aperitivos"},   # 13 recetas
]


def seed_categories():
    with app.app_context():
        print("Iniciando seed de categorías...")

        existing_count = Category.query.count()
        if existing_count > 0:
            print(
                f"❗ Ya existen {existing_count} categorías en la BD. "
                "Por seguridad NO se creó nada.\n"
                "Si quieres FORZAR el orden, limpia la tabla de categorías "
                "y vuelve a ejecutar este seeder."
            )
            return

       
        created_count = 0

        for index, data in enumerate(CATEGORIES_DATA, start=1):
            name = data["name_category"].strip()

            new_category = Category(name_category=name)
            db.session.add(new_category)
            db.session.flush()  

            print(
                f"{index}. Categoría creada: {new_category.name_category} "
                f"(id={new_category.id_category})"
            )
            created_count += 1

        db.session.commit()

        total_categories = Category.query.count()
        print(
            f"Seed terminado. Categorías nuevas creadas: {created_count}. "
            f"Total en BD: {total_categories}."
        )


if __name__ == "__main__":
    seed_categories()
