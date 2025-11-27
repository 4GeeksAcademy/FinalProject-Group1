"""
Script para crear recetas de prueba(40 recetas).
Ejecutar con: cd src y  pipenv run python seed_recipes.py
"""

from api.models import db, Recipe, Ingredient, RecipeIngredient, Category, User, difficultyEnum, stateRecipeEnum, UnitEnum
from app import app

# Datos de recetas de prueba (40 recetas)
RECIPES_DATA = [
    {"title": "Pasta Carbonara Clásica", "steps": "1. Cocinar la pasta al dente\n2. Freír el tocino\n3. Mezclar huevos con queso\n4. Combinar todo", "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Pasta", 400, "g"), ("Tocino", 200, "g"), ("Huevo", 3, "unidades")]},
    {"title": "Ensalada César", "steps": "1. Lavar la lechuga\n2. Preparar el aderezo\n3. Agregar crutones\n4. Mezclar todo", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 2, "ingredients": [("Lechuga", 200, "g"), ("Pollo", 150, "g"), ("Queso parmesano", 50, "g")]},
    {"title": "Tacos de Carne Asada", "steps": "1. Marinar la carne\n2. Asar a la parrilla\n3. Cortar en tiras\n4. Servir en tortillas", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 6, "ingredients": [("Carne de res", 500, "g"), ("Tortilla", 12, "unidades"), ("Cebolla", 1, "unidades")]},
    {"title": "Sopa de Tomate", "steps": "1. Asar los tomates\n2. Licuar con ajo\n3. Cocinar a fuego lento\n4. Servir con crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tomate", 6, "unidades"), ("Ajo", 3, "unidades"), ("Crema", 100, "ml")]},
    {"title": "Pollo al Curry", "steps": "1. Dorar el pollo\n2. Añadir curry y especias\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Curry", 30, "g"), ("Leche de coco", 400, "ml")]},
    {"title": "Pizza Margherita", "steps": "1. Preparar la masa\n2. Añadir salsa de tomate\n3. Agregar mozzarella\n4. Hornear 15 min", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 4, "ingredients": [("Harina", 300, "g"), ("Mozzarella", 200, "g"), ("Tomate", 3, "unidades")]},
    {"title": "Brownies de Chocolate", "steps": "1. Derretir chocolate\n2. Mezclar ingredientes\n3. Verter en molde\n4. Hornear 25 min", "image": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 12, "ingredients": [("Chocolate", 200, "g"), ("Mantequilla", 150, "g"), ("Azúcar", 200, "g")]},
    {"title": "Ceviche de Camarón", "steps": "1. Limpiar camarones\n2. Marinar en limón\n3. Agregar verduras\n4. Refrigerar 30 min", "image": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Camarón", 500, "g"), ("Limón", 8, "unidades"), ("Cebolla morada", 1, "unidades")]},
    {"title": "Arroz con Pollo", "steps": "1. Dorar el pollo\n2. Sofreír verduras\n3. Añadir arroz y caldo\n4. Cocinar 25 min", "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 800, "g"), ("Zanahoria", 2, "unidades")]},
    {"title": "Hamburguesa Clásica", "steps": "1. Formar las carnes\n2. Asar a la parrilla\n3. Tostar el pan\n4. Armar con vegetales", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Carne molida", 500, "g"), ("Pan de hamburguesa", 4, "unidades"), ("Queso cheddar", 4, "unidades")]},
    {"title": "Lasaña Boloñesa", "steps": "1. Preparar salsa boloñesa\n2. Hacer bechamel\n3. Armar capas\n4. Hornear 45 min", "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 8, "ingredients": [("Pasta lasaña", 500, "g"), ("Carne molida", 600, "g"), ("Queso mozzarella", 300, "g")]},
    {"title": "Guacamole Fresco", "steps": "1. Machacar aguacates\n2. Picar cebolla y tomate\n3. Añadir limón y cilantro\n4. Sazonar", "image": "https://images.unsplash.com/photo-1604908177777-9c51f0de42d5?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 4, "ingredients": [("Aguacate", 3, "unidades"), ("Tomate", 1, "unidades"), ("Cilantro", 20, "g")]},
    {"title": "Sushi Roll California", "steps": "1. Preparar arroz de sushi\n2. Extender en nori\n3. Rellenar y enrollar\n4. Cortar en piezas", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 4, "ingredients": [("Arroz para sushi", 300, "g"), ("Cangrejo", 200, "g"), ("Aguacate", 2, "unidades")]},
    {"title": "Pancakes Esponjosos", "steps": "1. Mezclar ingredientes secos\n2. Añadir húmedos\n3. Cocinar en sartén\n4. Servir con miel", "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Harina", 200, "g"), ("Leche", 250, "ml"), ("Huevo", 2, "unidades")]},
    {"title": "Paella Valenciana", "steps": "1. Sofreír carnes\n2. Añadir verduras\n3. Incorporar arroz y caldo\n4. Cocinar sin revolver", "image": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 75, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 400, "g"), ("Mariscos", 300, "g")]},
    {"title": "Tiramisú Italiano", "steps": "1. Preparar crema de mascarpone\n2. Mojar bizcochos en café\n3. Armar capas\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Mascarpone", 500, "g"), ("Bizcocho", 300, "g"), ("Café", 300, "ml")]},
    {"title": "Wrap de Pollo", "steps": "1. Cocinar el pollo\n2. Cortar verduras\n3. Calentar tortilla\n4. Enrollar con ingredientes", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 2, "ingredients": [("Pollo", 200, "g"), ("Tortilla de harina", 2, "unidades"), ("Lechuga", 50, "g")]},
    {"title": "Crema de Champiñones", "steps": "1. Saltear champiñones\n2. Añadir caldo\n3. Licuar hasta cremoso\n4. Añadir crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Champiñón", 400, "g"), ("Crema", 200, "ml"), ("Cebolla", 1, "unidades")]},
    {"title": "Costillas BBQ", "steps": "1. Marinar costillas\n2. Hornear tapadas 2 horas\n3. Añadir salsa BBQ\n4. Gratinar 15 min", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 150, "portions": 4, "ingredients": [("Costillas de cerdo", 1000, "g"), ("Salsa BBQ", 250, "ml"), ("Miel", 50, "ml")]},
    {"title": "Smoothie de Frutas", "steps": "1. Cortar frutas\n2. Añadir yogurt\n3. Licuar todo\n4. Servir frío", "image": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 5, "portions": 2, "ingredients": [("Fresa", 150, "g"), ("Plátano", 1, "unidades"), ("Yogurt", 200, "ml")]},
    {"title": "Enchiladas Verdes", "steps": "1. Preparar salsa verde\n2. Rellenar tortillas con pollo\n3. Bañar con salsa\n4. Gratinar con queso", "image": "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Tortilla", 8, "unidades"), ("Pollo", 400, "g"), ("Tomate verde", 500, "g")]},
    {"title": "Risotto de Hongos", "steps": "1. Saltear hongos\n2. Tostar arroz arborio\n3. Añadir caldo poco a poco\n4. Terminar con parmesano", "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 45, "portions": 4, "ingredients": [("Arroz arborio", 300, "g"), ("Champiñón", 250, "g"), ("Queso parmesano", 80, "g")]},
    {"title": "Fish and Chips", "steps": "1. Preparar masa para rebozar\n2. Freír el pescado\n3. Cortar y freír papas\n4. Servir con salsa tártara", "image": "https://images.unsplash.com/photo-1588167056547-c9e0954f8b20?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pescado blanco", 600, "g"), ("Papa", 800, "g"), ("Harina", 200, "g")]},
    {"title": "Flan de Caramelo", "steps": "1. Hacer caramelo\n2. Mezclar huevos con leche\n3. Verter en molde\n4. Hornear a baño maría", "image": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 8, "ingredients": [("Huevo", 6, "unidades"), ("Leche", 500, "ml"), ("Azúcar", 200, "g")]},
    {"title": "Pad Thai", "steps": "1. Remojar fideos de arroz\n2. Saltear con huevo y tofu\n3. Añadir salsa pad thai\n4. Servir con cacahuates", "image": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Fideos de arroz", 300, "g"), ("Huevo", 2, "unidades"), ("Cacahuate", 50, "g")]},
    {"title": "Empanadas de Carne", "steps": "1. Preparar el relleno\n2. Armar las empanadas\n3. Sellar los bordes\n4. Hornear hasta dorar", "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 12, "ingredients": [("Masa para empanadas", 500, "g"), ("Carne molida", 400, "g"), ("Cebolla", 2, "unidades")]},
    {"title": "Gazpacho Andaluz", "steps": "1. Triturar tomates\n2. Añadir pepino y pimiento\n3. Agregar vinagre y aceite\n4. Refrigerar 2 horas", "image": "https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Tomate", 1000, "g"), ("Pepino", 1, "unidades"), ("Pimiento", 1, "unidades")]},
    {"title": "Pollo Teriyaki", "steps": "1. Marinar el pollo\n2. Saltear en sartén\n3. Añadir salsa teriyaki\n4. Servir con arroz", "image": "https://images.unsplash.com/photo-1608751237744-3b5a49687dea?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Pollo", 500, "g"), ("Salsa teriyaki", 100, "ml"), ("Arroz", 300, "g")]},
    {"title": "Cheesecake New York", "steps": "1. Hacer base de galleta\n2. Preparar mezcla de queso\n3. Hornear a baja temperatura\n4. Refrigerar toda la noche", "image": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 12, "ingredients": [("Queso crema", 600, "g"), ("Galleta", 200, "g"), ("Azúcar", 150, "g")]},
    {"title": "Tacos al Pastor", "steps": "1. Marinar cerdo con achiote\n2. Asar en trompo o sartén\n3. Cortar en trozos\n4. Servir con piña", "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Cerdo", 600, "g"), ("Piña", 200, "g"), ("Tortilla", 12, "unidades")]},
    {"title": "Sopa Minestrone", "steps": "1. Sofreír verduras\n2. Añadir caldo y tomate\n3. Agregar pasta y frijoles\n4. Cocinar 30 min", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 45, "portions": 6, "ingredients": [("Pasta corta", 150, "g"), ("Frijol", 200, "g"), ("Calabacín", 2, "unidades")]},
    {"title": "Burritos de Pollo", "steps": "1. Cocinar el pollo\n2. Preparar frijoles y arroz\n3. Calentar tortillas\n4. Armar y enrollar", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 4, "ingredients": [("Pollo", 400, "g"), ("Tortilla de harina", 4, "unidades"), ("Frijol", 200, "g")]},
    {"title": "Pasta Alfredo", "steps": "1. Cocinar fettuccine\n2. Preparar salsa de crema\n3. Añadir parmesano\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fettuccine", 400, "g"), ("Crema", 300, "ml"), ("Queso parmesano", 100, "g")]},
    {"title": "Curry de Garbanzos", "steps": "1. Sofreír especias\n2. Añadir tomate y garbanzos\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Garbanzo", 400, "g"), ("Leche de coco", 400, "ml"), ("Tomate", 3, "unidades")]},
    {"title": "Croquetas de Jamón", "steps": "1. Hacer bechamel espesa\n2. Añadir jamón picado\n3. Enfriar y formar\n4. Empanizar y freír", "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 20, "ingredients": [("Jamón", 200, "g"), ("Harina", 100, "g"), ("Leche", 500, "ml")]},
    {"title": "Ensalada Griega", "steps": "1. Cortar pepino y tomate\n2. Añadir aceitunas y cebolla\n3. Agregar queso feta\n4. Aliñar con aceite", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Pepino", 2, "unidades"), ("Tomate", 3, "unidades"), ("Queso feta", 150, "g")]},
    {"title": "Pollo a la Naranja", "steps": "1. Dorar el pollo\n2. Preparar salsa de naranja\n3. Bañar el pollo\n4. Hornear 20 min", "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Naranja", 4, "unidades"), ("Miel", 50, "ml")]},
    {"title": "Quesadillas de Queso", "steps": "1. Calentar tortilla\n2. Añadir queso\n3. Doblar y dorar\n4. Servir con guacamole", "image": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&q=80", "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Tortilla de harina", 4, "unidades"), ("Queso Oaxaca", 200, "g"), ("Jalapeño", 2, "unidades")]},
    {"title": "Mousse de Chocolate", "steps": "1. Derretir chocolate\n2. Batir claras a punto de nieve\n3. Mezclar con cuidado\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&q=80", "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 6, "ingredients": [("Chocolate", 200, "g"), ("Huevo", 4, "unidades"), ("Azúcar", 50, "g")]},
    {"title": "Ramen Japonés", "steps": "1. Preparar caldo dashi\n2. Cocinar fideos ramen\n3. Añadir cerdo y huevo\n4. Decorar con nori", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80", "difficulty": difficultyEnum.DIFFICULT, "prep_time": 120, "portions": 4, "ingredients": [("Fideos ramen", 400, "g"), ("Cerdo", 300, "g"), ("Huevo", 4, "unidades")]},
]

def get_or_create_ingredient(name):
    ingredient = Ingredient.query.filter_by(name=name).first()
    if not ingredient:
        ingredient = Ingredient(name=name, calories_per_100=50, protein_per_100=2, carbs_per_100=10, fat_per_100=1)
        db.session.add(ingredient)
        db.session.flush()
    return ingredient

def map_unit(unit_str):
    unit_map = {"g": UnitEnum.GRAMS, "ml": UnitEnum.MILLILITERS, "unidades": UnitEnum.UNITS, "kg": UnitEnum.KILOGRAMS, "l": UnitEnum.LITERS}
    return unit_map.get(unit_str, UnitEnum.GRAMS)

def seed_recipes():
    with app.app_context():
        categories = Category.query.all()
        if not categories:
            print("No hay categorías. Crea al menos una categoría primero.")
            return
        
        user = User.query.first()
        if not user:
            print(" No hay usuarios. Crea al menos un usuario primero.")
            return
        
        print(f"Usando usuario: {user.username}")
        print(f"Categorías disponibles: {[c.name_category for c in categories]}")
        
        created_count = 0
        
        for i, recipe_data in enumerate(RECIPES_DATA):
            existing = Recipe.query.filter_by(title=recipe_data["title"]).first()
            if existing:
                print(f"Saltando '{recipe_data['title']}' (ya existe)")
                continue
            
            category = categories[i % len(categories)]
            
            recipe = Recipe(
                title=recipe_data["title"],
                steps=recipe_data["steps"],
                image=recipe_data["image"],
                difficulty=recipe_data["difficulty"],
                preparation_time_min=recipe_data["prep_time"],
                portions=recipe_data["portions"],
                state_recipe=stateRecipeEnum.PUBLISHED,
                user_id=user.id_user,
                category_id=category.id_category
            )
            db.session.add(recipe)
            db.session.flush()
            
            for ing_name, quantity, unit in recipe_data["ingredients"]:
                ingredient = get_or_create_ingredient(ing_name)
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe.id_recipe,
                    ingredient_catalog_id=ingredient.id_ingredient,
                    quantity=quantity,
                    unit_measure=map_unit(unit)
                )
                db.session.add(recipe_ingredient)
            
            created_count += 1
            print(f"Creada: '{recipe_data['title']}' en '{category.name_category}'")
        
        db.session.commit()
        print(f"\n ¡Listo! Se crearon {created_count} recetas nuevas.")

if __name__ == "__main__":
    seed_recipes()