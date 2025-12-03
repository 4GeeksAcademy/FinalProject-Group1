"""
Script para crear recetas de prueba.
Ejecutar con: cd src y  pipenv run python seed_recipes.py
"""

from api.models import db, Recipe, Ingredient, RecipeIngredient, Category, User,  RecipeRating, RecipeFavorite, difficultyEnum, stateRecipeEnum, UnitEnum
from app import app
import random

# Datos de recetas de prueba 
RECIPES_DATA = [
    # CATEGORÍA 1: PASTAS ITALIANAS (10 recetas)

    {"category_index": 0, "title": "Pasta Carbonara Clásica", "steps": "1. Cocinar la pasta al dente\n2. Freír el tocino\n3. Mezclar huevos con queso\n4. Combinar todo", "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Pasta", 400, "g"), ("Tocino", 200, "g"), ("Huevo", 3, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False,},
    
    {"category_index": 0, "title": "Pasta Alfredo", "steps": "1. Cocinar fettuccine\n2. Preparar salsa de crema\n3. Añadir parmesano\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fettuccine", 400, "g"), ("Crema", 300, "ml"), ("Queso parmesano", 100, "g")],"auto_rating": 3, "rating_count": 11, "make_favorite": False},
    
    {"category_index": 0, "title": "Lasaña Boloñesa", "steps": "1. Preparar salsa boloñesa\n2. Hacer bechamel\n3. Armar capas\n4. Hornear 45 min", "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 8, "ingredients": [("Pasta lasaña", 500, "g"), ("Carne molida", 600, "g"), ("Queso mozzarella", 300, "g")],"auto_rating": 3, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 0, "title": "Fusilli con Salsa de Tomate y Albahaca", "steps": "1. Cocinar fusilli\n2. Preparar salsa de tomate\n3. Añadir albahaca\n4. Mezclar", "image": "https://images.unsplash.com/photo-1743591255092-e986dda52fef?q=80&w=714&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fusilli", 400, "g"), ("Tomate", 4, "unidades"), ("Albahaca", 20, "g")],"auto_rating": 3, "rating_count": 42, "make_favorite": False},
    
    {"category_index": 0, "title": "Ensalada de Pasta", "steps": "1. Cocer pasta\n2. Añadir tomate y mozzarella\n3. Agregar albahaca\n4. Aliñar con pesto", "image": "https://plus.unsplash.com/premium_photo-1726754590888-aee3acabeb43?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Pasta corta", 400, "g"), ("Tomate cherry", 200, "g"), ("Mozzarella", 200, "g")],"auto_rating": 3, "rating_count": 7, "make_favorite": False},
    
    {"category_index": 0, "title": "Pasta nesca", "steps": "1. Cocinar spaghetti\n2. Saltear ajo y anchoas\n3. Añadir tomate y aceitunas\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1733700469181-fc8edf9af33f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Spaghetti", 400, "g"), ("Anchoas", 50, "g"), ("Aceitunas", 100, "g")],"auto_rating": 5, "rating_count": 10, "make_favorite": False},
    
    {"category_index": 0, "title": "Pasta Primavera", "steps": "1. Cocinar pasta\n2. Saltear vegetales frescos\n3. Añadir crema ligera\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 28, "portions": 4, "ingredients": [("Pasta penne", 400, "g"), ("Brócoli", 200, "g"), ("Zanahoria", 150, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 0,"title": "Spaghetti Boloñesa", "steps": "1. Cocinar spaghetti\n2. Preparar salsa boloñesa\n3. Cocinar a fuego lento 30 min\n4. Servir con parmesano", "image": "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Spaghetti", 500, "g"), ("Carne molida", 500, "g"), ("Tomate", 6, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 0,"title": "Pasta Arrabbiata", "steps": "1. Cocinar penne\n2. Preparar salsa picante de tomate\n3. Añadir chile\n4. Servir con perejil", "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 22, "portions": 4, "ingredients": [("Penne", 400, "g"), ("Chile", 3, "unidades"), ("Tomate", 5, "unidades")],"auto_rating": 5, "rating_count": 50, "make_favorite": False},
    
    {"category_index": 0,"title": "Ravioles de Ricota", "steps": "1. Preparar masa de pasta\n2. Hacer relleno de ricota\n3. Armar ravioles\n4. Cocinar y servir con salsa", "image": "https://es.cravingsjournal.com/wp-content/uploads/2021/09/ravioles-de-ricotta-y-espinaca-internet-1.jpg?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 75, "portions": 4, "ingredients": [("Harina", 400, "g"), ("Ricota", 300, "g"), ("Huevo", 4, "unidades")],"auto_rating": 5, "rating_count": 62, "make_favorite": True},


# CATEGORÍA 2: SOPAS Y CREMAS (12 recetas)

    {"category_index": 1, "title": "Crema de Champiñones", "steps": "1. Saltear champiñones\n2. Añadir caldo\n3. Licuar hasta cremoso\n4. Añadir crema", "image": "https://plus.unsplash.com/premium_photo-1669631647057-3403888e87da?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Champiñón", 400, "g"), ("Crema", 200, "ml"), ("Cebolla", 1, "unidades")], "auto_rating": 3, "rating_count": 13, "make_favorite": False},

    {"category_index": 1, "title": "Sopa Minestrone", "steps": "1. Sofreír verduras\n2. Añadir caldo y tomate\n3. Agregar pasta y frijoles\n4. Cocinar 30 min", "image": "https://images.unsplash.com/photo-1603355736640-34a2bee52da3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 45, "portions": 6, "ingredients": [("Pasta corta", 150, "g"), ("Frijol", 200, "g"), ("Calabacín", 2, "unidades")],"auto_rating": 3, "rating_count": 10, "make_favorite": False},
    
    {"category_index": 1, "title": "Gazpacho Andaluz", "steps": "1. Triturar tomates\n2. Añadir pepino y pimiento\n3. Agregar vinagre y aceite\n4. Refrigerar 2 horas", "image": "https://images.unsplash.com/photo-1638043139484-1534e2c14bcb?q=80&w=1077&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Tomate", 1000, "g"), ("Pepino", 1, "unidades"), ("Pimiento", 1, "unidades")],"auto_rating": 3, "rating_count": 14, "make_favorite": False},
    
    {"category_index": 1, "title": "Sopa de Cebolla Francesa", "steps": "1. Caramelizar cebollas\n2. Añadir vino y caldo\n3. Servir en cazuelas\n4. Gratinar con queso", "image": "https://images.unsplash.com/photo-1726514730712-1445245c7f91?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 4, "ingredients": [("Cebolla", 6, "unidades"), ("Queso gruyere", 200, "g"), ("Pan", 4, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 1, "title": "Crema de Calabaza", "steps": "1. Asar calabaza\n2. Licuar con caldo\n3. Añadir especias\n4. Terminar con crema", "image": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 6, "ingredients": [("Calabaza", 800, "g"), ("Caldo de verduras", 1000, "ml"), ("Crema", 150, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 1, "title": "Sopa de Lentejas", "steps": "1. Remojar lentejas\n2. Sofreír verduras\n3. Añadir lentejas y caldo\n4. Cocinar 45 minutos", "image": "https://plus.unsplash.com/premium_photo-1712678665862-3c51d1fac466?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 60, "portions": 6, "ingredients": [("Lenteja", 400, "g"), ("Zanahoria", 2, "unidades"), ("Chorizo", 150, "g")],"auto_rating": 3, "rating_count": 23, "make_favorite": False},
    
    {"category_index": 1, "title": "Crema de Brócoli", "steps": "1. Cocer brócoli\n2. Licuar con caldo\n3. Añadir queso crema\n4. Servir con crutones", "image": "https://plus.unsplash.com/premium_photo-1723532544295-73989ae6c2b6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Brócoli", 600, "g"), ("Queso crema", 100, "g"), ("Caldo", 800, "ml")],"auto_rating": 5, "rating_count": 7, "make_favorite": False},
    
    {"category_index": 1, "title": "Crema de Espárragos", "steps": "1. Cocer espárragos\n2. Licuar con caldo\n3. Añadir crema\n4. Sazonar", "image": "https://images.unsplash.com/photo-1719785045946-cdb5a4506972?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Espárrago", 500, "g"), ("Crema", 150, "ml"), ("Caldo", 700, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 1, "title": "Sopa de Tortilla", "steps": "1. Freír tiras de tortilla\n2. Preparar caldo de tomate\n3. Servir con aguacate\n4. Añadir queso y crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 6, "ingredients": [("Tortilla", 8, "unidades"), ("Tomate", 6, "unidades"), ("Aguacate", 2, "unidades")],"auto_rating": 4, "rating_count": 22, "make_favorite": False},
    
    {"category_index": 1, "title": "Sopa de Pollo con Fideos", "steps": "1. Cocinar pollo con verduras\n2. Desmenuzar pollo\n3. Añadir fideos\n4. Cocinar 10 min más", "image": "https://plus.unsplash.com/premium_photo-1675707499311-726434ce10fc?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 6, "ingredients": [("Pollo", 500, "g"), ("Fideos", 150, "g"), ("Zanahoria", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 1, "title": "Crema de Zanahoria", "steps": "1. Cocer zanahorias\n2. Licuar con caldo\n3. Añadir jengibre\n4. Servir con crema", "image": "https://www.sortirambnens.com/wp-content/uploads/2019/02/crema-de-pastanaga.jpg?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 28, "portions": 4, "ingredients": [("Zanahoria", 800, "g"), ("Jengibre", 20, "g"), ("Crema", 100, "ml")],"auto_rating": 5, "rating_count": 80, "make_favorite": True},

    {"category_index": 1, "title": "Sopa de Tomate", "steps": "1. Asar los tomates\n2. Licuar con ajo\n3. Cocinar a fuego lento\n4. Servir con crema", "image": "https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tomate", 6, "unidades"), ("Ajo", 3, "unidades"), ("Crema", 100, "ml")],"auto_rating": 3, "rating_count": 113, "make_favorite": False},

# CATEGORÍA 3: ENSALADAS (12 recetas)

    {"category_index": 2, "title": "Ensalada César", "steps": "1. Lavar la lechuga\n2. Preparar el aderezo\n3. Agregar crutones\n4. Mezclar todo", "image": "https://plus.unsplash.com/premium_photo-1700089483464-4f76cc3d360b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 2, "ingredients": [("Lechuga", 200, "g"), ("Pollo", 150, "g"), ("Queso parmesano", 50, "g")],"auto_rating": 3, "rating_count": 8, "make_favorite": True},
    
    {"category_index": 2, "title": "Ensalada Griega", "steps": "1. Cortar pepino y tomate\n2. Añadir aceitunas y cebolla\n3. Agregar queso feta\n4. Aliñar con aceite", "image": "https://plus.unsplash.com/premium_photo-1690561082636-06237f98bfab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Pepino", 2, "unidades"), ("Tomate", 3, "unidades"), ("Queso feta", 150, "g")],"auto_rating": 3, "rating_count": 17, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada Caprese", "steps": "1. Cortar tomate y mozzarella\n2. Intercalar en plato\n3. Añadir albahaca fresca\n4. Rociar con aceite", "image": "https://7diasdesabor.com/wp-content/uploads/2023/07/APERITIVO-1.jpg?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Tomate", 3, "unidades"), ("Mozzarella", 250, "g"), ("Albahaca", 20, "g")],"auto_rating": 3, "rating_count": 19, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada de Quinoa", "steps": "1. Cocer quinoa\n2. Picar vegetales frescos\n3. Mezclar con vinagreta\n4. Añadir nueces", "image": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Quinoa", 200, "g"), ("Tomate cherry", 150, "g"), ("Pepino", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada Waldorf", "steps": "1. Cortar manzana y apio\n2. Añadir nueces\n3. Mezclar con mayonesa\n4. Servir sobre lechuga", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Manzana", 2, "unidades"), ("Apio", 3, "unidades"), ("Nuez", 100, "g")],"auto_rating": 3, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada Nicoise", "steps": "1. Cocer huevos y papas\n2. Añadir atún y judías\n3. Agregar aceitunas\n4. Aliñar con vinagreta", "image": "https://images.unsplash.com/photo-1725030660031-585ea459d55f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Atún", 300, "g"), ("Papa", 400, "g"), ("Huevo", 4, "unidades")],"auto_rating": 3, "rating_count": 5, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada de Espinacas", "steps": "1. Lavar espinacas\n2. Añadir fresas y nueces\n3. Agregar queso de cabra\n4. Aliñar con balsámico", "image": "https://plus.unsplash.com/premium_photo-1701699258166-b14d782a4188?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Espinaca", 200, "g"), ("Fresa", 150, "g"), ("Queso de cabra", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2,"title": "Ensalada Mediterránea", "steps": "1. Mezclar lechuga y rúcula\n2. Añadir tomate y pepino\n3. Agregar garbanzos\n4. Aliñar con limón", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Lechuga mixta", 250, "g"), ("Garbanzo", 200, "g"), ("Pepino", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada Cobb", "steps": "1. Disponer lechuga de base\n2. Añadir pollo en tiras\n3. Agregar aguacate y tocino\n4. Servir con aderezo ranch", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 4, "ingredients": [("Lechuga", 300, "g"), ("Pollo", 400, "g"), ("Aguacate", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada de Mango", "steps": "1. Cortar mango en cubos\n2. Añadir cebolla morada\n3. Agregar cilantro\n4. Aliñar con limón", "image": "https://plus.unsplash.com/premium_photo-1695055513545-c13fa9363ad6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Mango", 2, "unidades"), ("Cebolla morada", 1, "unidades"), ("Cilantro", 30, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2, "title": "Ensalada de Lentejas", "steps": "1. Cocer lentejas\n2. Picar pimiento y cebolla\n3. Mezclar con vinagreta\n4. Servir fría", "image": "https://plus.unsplash.com/premium_photo-1699881082057-2dec9aad9a10?q=80&w=732&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 6, "ingredients": [("Lenteja", 300, "g"), ("Pimiento", 2, "unidades"), ("Cebolla", 1, "unidades")],"auto_rating": 5, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 2,"title": "Ensalada de Col", "steps": "1. Rallar col y zanahoria\n2. Preparar aderezo cremoso\n3. Mezclar bien\n4. Refrigerar 30 min", "image": "https://images.unsplash.com/photo-1630409350018-0e06ea178b92?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 8, "ingredients": [("Col", 500, "g"), ("Zanahoria", 2, "unidades"), ("Mayonesa", 150, "ml")],"auto_rating": 4, "rating_count": 11, "make_favorite": False},


# CATEGORÍA 4: PLATOS CON POLLO (12 recetas)

    {"category_index": 3, "title": "Pollo al Curry", "steps": "1. Dorar el pollo\n2. Añadir curry y especias\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Curry", 30, "g"), ("Leche de coco", 400, "ml")],"auto_rating": 2, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Pollo a la Naranja", "steps": "1. Dorar el pollo\n2. Preparar salsa de naranja\n3. Bañar el pollo\n4. Hornear 20 min", "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Naranja", 4, "unidades"), ("Miel", 50, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Arroz con Pollo", "steps": "1. Dorar el pollo\n2. Sofreír verduras\n3. Añadir arroz y caldo\n4. Cocinar 25 min", "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 800, "g"), ("Zanahoria", 2, "unidades")],"auto_rating": 2, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Wrap de Pollo", "steps": "1. Cocinar el pollo\n2. Cortar verduras\n3. Calentar tortilla\n4. Enrollar con ingredientes", "image": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 2, "ingredients": [("Pollo", 200, "g"), ("Tortilla de harina", 2, "unidades"), ("Lechuga", 50, "g")],"auto_rating": 4, "rating_count": 32, "make_favorite": False},
    
    {"category_index": 3, "title": "Burritos de Pollo", "steps": "1. Cocinar el pollo\n2. Preparar frijoles y arroz\n3. Calentar tortillas\n4. Armar y enrollar", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 4, "ingredients": [("Pollo", 400, "g"), ("Tortilla de harina", 4, "unidades"), ("Frijol", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Alitas Buffalo", "steps": "1. Hornear las alitas\n2. Preparar salsa buffalo\n3. Bañar alitas en salsa\n4. Servir con aderezo ranch", "image": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Alitas de pollo", 1000, "g"), ("Salsa picante", 150, "ml"), ("Mantequilla", 80, "g")],"auto_rating": 4, "rating_count": 13, "make_favorite": True},
    
    {"category_index": 3, "title": "Pollo al Limón y Romero", "steps": "1. Marinar pollo\n2. Sellar en sartén\n3. Añadir limón y romero\n4. Hornear 20 min", "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Limón", 2, "unidades"), ("Romero", 10, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Pollo Teriyaki", "steps": "1. Cortar pollo en cubos\n2. Marinar en salsa teriyaki\n3. Saltear con vegetales\n4. Servir con arroz", "image": "https://images.unsplash.com/photo-1609183480237-ccbb2d7c5772?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Pollo", 500, "g"), ("Salsa teriyaki", 120, "ml"), ("Brócoli", 200, "g")],"auto_rating": 3, "rating_count": 40, "make_favorite": True},
    
    {"category_index": 3, "title": "Pollo Tikka Masala", "steps": "1. Marinar pollo con yogurt\n2. Asar el pollo\n3. Preparar salsa masala\n4. Cocinar a fuego lento", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 55, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Yogurt", 200, "ml"), ("Garam masala", 30, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Pollo Parmesano", "steps": "1. Empanar pechugas de pollo\n2. Freír hasta dorar\n3. Cubrir con salsa y queso\n4. Gratinar en horno", "image": "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Pechuga de pollo", 600, "g"), ("Queso mozzarella", 200, "g"), ("Pan rallado", 150, "g")],"auto_rating": 5, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 3, "title": "Pollo a la Plancha con Hierbas", "steps": "1. Marinar con hierbas\n2. Calentar plancha\n3. Cocinar 6 min por lado\n4. Servir con limón", "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Pechuga de pollo", 600, "g"), ("Hierbas mixtas", 20, "g"), ("Limón", 2, "unidades")],"auto_rating": 2, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 3, "title": "Pollo Agridulce", "steps": "1. Cortar y empanar pollo\n2. Freír hasta dorar\n3. Preparar salsa agridulce\n4. Mezclar y servir", "image": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Piña", 200, "g"), ("Vinagre", 50, "ml")],"auto_rating": 5, "rating_count": 91, "make_favorite": False},


# CATEGORÍA 5: COMIDA MEXICANA (12 recetas)

    {"category_index": 4, "title": "Tacos de Carne Asada", "steps": "1. Marinar la carne\n2. Asar a la parrilla\n3. Cortar en tiras\n4. Servir en tortillas", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 6, "ingredients": [("Carne de res", 500, "g"), ("Tortilla", 12, "unidades"), ("Cebolla", 1, "unidades")],"auto_rating": 3, "rating_count": 2, "make_favorite": False},
    
    {"category_index": 4, "title": "Enchiladas Verdes", "steps": "1. Preparar salsa verde\n2. Rellenar tortillas con pollo\n3. Bañar con salsa\n4. Gratinar con queso", "image": "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Tortilla", 8, "unidades"), ("Pollo", 400, "g"), ("Tomate verde", 500, "g")],"auto_rating": 2, "rating_count": 5, "make_favorite": True},
    
    {"category_index": 4, "title": "Quesadillas de Queso", "steps": "1. Calentar tortilla\n2. Añadir queso\n3. Doblar y dorar\n4. Servir con guacamole", "image": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Tortilla de harina", 4, "unidades"), ("Queso Oaxaca", 200, "g"), ("Jalapeño", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Tacos al Pastor", "steps": "1. Marinar cerdo con achiote\n2. Asar en trompo o sartén\n3. Cortar en trozos\n4. Servir con piña", "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Cerdo", 600, "g"), ("Piña", 200, "g"), ("Tortilla", 12, "unidades")],"auto_rating": 3, "rating_count": 14, "make_favorite": False},
    
    {"category_index": 4, "title": "Nachos con Queso", "steps": "1. Extender totopos\n2. Cubrir con queso cheddar\n3. Gratinar en horno\n4. Añadir jalapeños", "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Totopos", 300, "g"), ("Queso cheddar", 200, "g"), ("Jalapeño", 3, "unidades")],"auto_rating": 3, "rating_count": 18, "make_favorite": False},
    
    {"category_index": 4,"title": "Pozole Rojo", "steps": "1. Cocer carne de cerdo\n2. Añadir maíz pozolero\n3. Preparar chile guajillo\n4. Servir con tostadas", "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 180, "portions": 10, "ingredients": [("Cerdo", 1500, "g"), ("Maíz pozolero", 800, "g"), ("Chile guajillo", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Chilaquiles Verdes", "steps": "1. Freír tortillas cortadas\n2. Preparar salsa verde\n3. Bañar totopos con salsa\n4. Servir con crema y queso", "image": "https://prensadehouston.com/wp-content/uploads/2024/06/CHILAQUILES-VERDES-1170x768.png?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tortilla", 10, "unidades"), ("Tomate verde", 400, "g"), ("Crema", 100, "ml")],"auto_rating": 3, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 4, "title": "Tacos de Pescado", "steps": "1. Empanar pescado\n2. Freír hasta dorar\n3. Preparar col rallada\n4. Servir en tortillas", "image": "https://mandolina.co/wp-content/uploads/2024/09/Tacos-de-salmon-con-aguacate-y-salsa-tartara-scaled.jpg?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Pescado blanco", 500, "g"), ("Tortilla", 8, "unidades"), ("Col", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Fajitas de Res", "steps": "1. Marinar carne en tiras\n2. Saltear con pimientos\n3. Calentar tortillas\n4. Servir con guacamole", "image": "https://mandolina.co/wp-content/uploads/2020/11/comidas-mexicanas-recetas-fajitas-de-carne.jpg?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Carne de res", 600, "g"), ("Pimiento", 3, "unidades"), ("Tortilla", 8, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Tamales de Pollo", "steps": "1. Preparar masa de maíz\n2. Hacer relleno de pollo\n3. Envolver en hojas\n4. Cocer al vapor 90 min", "image": "https://polloseldorado.co/wp-content/uploads/2024/04/Header-1-1024x536.jpg?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 120, "portions": 12, "ingredients": [("Masa de maíz", 1000, "g"), ("Pollo", 600, "g"), ("Hojas de maíz", 24, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Tostadas de Tinga", "steps": "1. Cocinar pollo desmenuzado\n2. Preparar salsa de chipotle\n3. Mezclar pollo con salsa\n4. Servir sobre tostadas", "image": "https://images.unsplash.com/photo-1657770651689-c948d7eed8f1?q=80&w=1212&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 6, "ingredients": [("Pollo", 500, "g"), ("Tostadas", 12, "unidades"), ("Chipotle", 3, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 4, "title": "Flautas de Pollo", "steps": "1. Desmenuzar pollo cocido\n2. Rellenar tortillas\n3. Enrollar y freír\n4. Servir con crema y lechuga", "image": "https://plus.unsplash.com/premium_photo-1664391997303-dab867f07ad4?q=80&w=1028&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Tortilla", 12, "unidades"), ("Pollo", 400, "g"), ("Crema", 150, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},


# CATEGORÍA 6: COMIDA ASIÁTICA (12 recetas)

    {"category_index": 5, "title": "Sushi Roll California", "steps": "1. Preparar arroz de sushi\n2. Extender en nori\n3. Rellenar y enrollar\n4. Cortar en piezas", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 4, "ingredients": [("Arroz para sushi", 300, "g"), ("Cangrejo", 200, "g"), ("Aguacate", 2, "unidades")],"auto_rating": 3, "rating_count": 7, "make_favorite": False},
    
    {"category_index": 5, "title": "Pad Thai", "steps": "1. Remojar fideos de arroz\n2. Saltear con huevo y tofu\n3. Añadir salsa pad thai\n4. Servir con cacahuates", "image": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Fideos de arroz", 300, "g"), ("Huevo", 2, "unidades"), ("Cacahuate", 50, "g")],"auto_rating": 3, "rating_count": 6, "make_favorite": False},
    
    {"category_index": 5, "title": "Ramen Japonés", "steps": "1. Preparar caldo dashi\n2. Cocinar fideos ramen\n3. Añadir cerdo y huevo\n4. Decorar con nori", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 120, "portions": 4, "ingredients": [("Fideos ramen", 400, "g"), ("Cerdo", 300, "g"), ("Huevo", 4, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 5, "title": "Sopa Wonton", "steps": "1. Preparar wontons\n2. Hacer caldo aromático\n3. Cocer wontons\n4. Servir con cebollín", "image": "https://images.unsplash.com/photo-1607095097076-bf0221751ed6?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 50, "portions": 4, "ingredients": [("Masa wonton", 300, "g"), ("Cerdo molido", 250, "g"), ("Cebollín", 30, "g")],"auto_rating": 3, "rating_count": 14, "make_favorite": False},
    
    {"category_index": 5, "title": "Sopa Tom Yum", "steps": "1. Hacer caldo picante\n2. Añadir camarones\n3. Agregar limón y cilantro\n4. Servir caliente", "image": "https://mochilerosentailandia.com/wp-content/uploads/2017/04/1-3.jpg?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Camarón", 400, "g"), ("Galanga", 30, "g"), ("Limón", 3, "unidades")],"auto_rating": 3, "rating_count": 15, "make_favorite": False},
    
    {"category_index": 5, "title": "Salteado de Vegetales Asiáticos", "steps": "1. Cortar vegetales\n2. Saltear con salsa soya\n3. Agregar jengibre\n4. Servir caliente", "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 3, "ingredients": [("Zanahoria", 1, "unidades"), ("Brócoli", 200, "g"), ("Salsa soya", 30, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 5, "title": "Chow Mein", "steps": "1. Cocinar fideos chinos\n2. Saltear vegetales y carne\n3. Añadir salsa de ostras\n4. Mezclar con fideos", "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Fideos chinos", 400, "g"), ("Pollo", 300, "g"), ("Salsa de ostras", 60, "ml")],"auto_rating": 3, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 5, "title": "Arroz Frito", "steps": "1. Cocinar arroz previamente\n2. Saltear con huevo\n3. Añadir vegetales y salsa soya\n4. Mezclar todo", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Arroz cocido", 600, "g"), ("Huevo", 3, "unidades"), ("Zanahoria", 1, "unidades")],"auto_rating": 3, "rating_count": 30, "make_favorite": False},
    
    {"category_index": 5, "title": "Dumplings al Vapor", "steps": "1. Preparar relleno de cerdo\n2. Armar dumplings\n3. Cocer al vapor 12 min\n4. Servir con salsa", "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 55, "portions": 6, "ingredients": [("Masa para dumplings", 400, "g"), ("Cerdo molido", 300, "g"), ("Col china", 150, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 5, "title": "Teriyaki de Salmón", "steps": "1. Marinar salmón en teriyaki\n2. Sellar en sartén\n3. Glasear con salsa\n4. Servir con arroz", "image": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 4, "ingredients": [("Salmón", 600, "g"), ("Salsa teriyaki", 100, "ml"), ("Ajonjolí", 20, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 5, "title": "Yakisoba", "steps": "1. Cocinar fideos yakisoba\n2. Saltear con vegetales\n3. Añadir salsa yakisoba\n4. Servir caliente", "image": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fideos yakisoba", 400, "g"), ("Repollo", 200, "g"), ("Salsa yakisoba", 80, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 5, "title": "Bibimbap Coreano", "steps": "1. Cocinar arroz\n2. Preparar vegetales salteados\n3. Añadir huevo frito\n4. Servir con gochujang", "image": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Arroz", 400, "g"), ("Espinaca", 150, "g"), ("Gochujang", 60, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
   

   # CATEGORÍA 7: MARISCOS Y PESCADOS (11 recetas)

    {"category_index": 6, "title": "Ceviche de Camarón", "steps": "1. Limpiar camarones\n2. Marinar en limón\n3. Agregar verduras\n4. Refrigerar 30 min", "image": "https://images.unsplash.com/photo-1626663011519-b42e5ee10056?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Camarón", 500, "g"), ("Limón", 8, "unidades"), ("Cebolla morada", 1, "unidades")],"auto_rating": 3, "rating_count": 31, "make_favorite": False},
    
    {"category_index": 6, "title": "Camarones al Ajillo", "steps": "1. Picar ajo finamente\n2. Saltear camarones\n3. Añadir vino blanco\n4. Terminar con perejil", "image": "https://images.unsplash.com/photo-1764337944130-45560c1f8b41?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Camarón", 500, "g"), ("Ajo", 6, "unidades"), ("Vino blanco", 100, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Fish and Chips", "steps": "1. Preparar masa para rebozar\n2. Freír el pescado\n3. Cortar y freír papas\n4. Servir con salsa tártara", "image": "https://images.unsplash.com/photo-1697748836791-9ddf7e616ece?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pescado blanco", 600, "g"), ("Papa", 800, "g"), ("Harina", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Paella Valenciana", "steps": "1. Sofreír carnes\n2. Añadir verduras\n3. Incorporar arroz y caldo\n4. Cocinar sin revolver", "image": "https://plus.unsplash.com/premium_photo-1664457234003-cf41eceb6a8f?q=80&w=693&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 75, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 400, "g"), ("Mariscos", 300, "g")],"auto_rating": 5, "rating_count": 18, "make_favorite": True},
    
    {"category_index": 6, "title": "Tostadas de Atún", "steps": "1. Tostar pan de caja\n2. Mezclar atún con mayonesa\n3. Añadir cebolla picada\n4. Montar sobre tostadas", "image": "https://d36fw6y2wq3bat.cloudfront.net/recipes/tosta-de-atun/900/tosta-de-atun_version_1658808094.jpg?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 4, "ingredients": [("Atún en lata", 300, "g"), ("Pan de caja", 8, "unidades"), ("Mayonesa", 80, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Bisque de Langosta", "steps": "1. Saltear cáscaras\n2. Hacer base con tomate\n3. Licuar y colar\n4. Añadir crema y coñac", "image": "https://images.unsplash.com/photo-1590759668628-05b0fc34bb70?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 4, "ingredients": [("Langosta", 800, "g"), ("Tomate", 400, "g"), ("Crema", 200, "ml")],"auto_rating": 5, "rating_count": 29, "make_favorite": False},
    
    {"category_index": 6, "title": "Salmón al Horno con Limón", "steps": "1. Marinar salmón con limón\n2. Colocar en papel aluminio\n3. Hornear 180°C por 20 min\n4. Servir con hierbas", "image": "https://images.unsplash.com/photo-1614627293113-e7e68163d958?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Salmón", 600, "g"), ("Limón", 3, "unidades"), ("Eneldo", 15, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Tilapia a la Veracruzana", "steps": "1. Dorar filetes de tilapia\n2. Preparar salsa de tomate\n3. Añadir aceitunas y alcaparras\n4. Cocinar 15 min", "image": "https://images.unsplash.com/photo-1606234157022-15343d99efa1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Tilapia", 600, "g"), ("Tomate", 5, "unidades"), ("Aceitunas", 80, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Pulpo a la Gallega", "steps": "1. Cocer pulpo en agua\n2. Cortar en rodajas\n3. Sazonar con pimentón\n4. Rociar con aceite de oliva", "image": "https://images.unsplash.com/photo-1626232442070-46902c617ec6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Pulpo", 1000, "g"), ("Pimentón", 20, "g"), ("Aceite de oliva", 80, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Brochetas de Camarón", "steps": "1. Marinar camarones\n2. Ensartar en palillos con vegetales\n3. Asar a la parrilla\n4. Servir con limón", "image": "https://plus.unsplash.com/premium_photo-1693221705442-3bb06c114aff?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Camarón", 600, "g"), ("Pimiento", 2, "unidades"), ("Cebolla", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 6, "title": "Bacalao al Pil Pil", "steps": "1. Desalar bacalao 24 horas\n2. Confitar en aceite y ajo\n3. Emulsionar moviendo sartén\n4. Servir caliente", "image":"https://www.cocina-ecuatoriana.com/base/stock/Recipe/bacalao-frito/bacalao-frito_web.jpg.webp?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 40, "portions": 4, "ingredients": [("Bacalao", 600, "g"), ("Ajo", 8, "unidades"), ("Aceite de oliva", 250, "ml")],"auto_rating": 3, "rating_count": 26, "make_favorite": True},


# CATEGORÍA 8: CARNES ROJAS (11 recetas)

    {"category_index": 7, "title": "Tacos de Carne Asada", "steps": "1. Marinar la carne\n2. Asar a la parrilla\n3. Cortar en tiras\n4. Servir en tortillas", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 6, "ingredients": [("Carne de res", 500, "g"), ("Tortilla", 12, "unidades"), ("Cebolla", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Hamburguesa Clásica", "steps": "1. Formar las carnes\n2. Asar a la parrilla\n3. Tostar el pan\n4. Armar con vegetales", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Carne molida", 500, "g"), ("Pan de hamburguesa", 4, "unidades"), ("Queso cheddar", 4, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "category_index": 7, "title": "Costillas BBQ", "steps": "1. Marinar costillas\n2. Hornear tapadas 2 horas\n3. Añadir salsa BBQ\n4. Gratinar 15 min", "image": "https://plus.unsplash.com/premium_photo-1664478272084-532c1bfebd25?q=80&w=1020&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 150, "portions": 4, "ingredients": [("Costillas de cerdo", 1000, "g"), ("Salsa BBQ", 250, "ml"), ("Miel", 50, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Bistec con Papas", "steps": "1. Cocinar bistec\n2. Freír papas\n3. Sazonar\n4. Servir", "image": "https://mandolina.co/wp-content/uploads/2023/12/bife-de-cuadril.jpg?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 3, "ingredients": [("Carne", 400, "g"), ("Papa", 500, "g"), ("Aceite", 20, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Carpaccio de Res", "steps": "1. Congelar carne ligeramente\n2. Cortar en láminas finas\n3. Disponer en plato\n4. Aliñar con aceite y parmesano", "image": "https://images.unsplash.com/photo-1721094231595-1f6451cf1f0f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 4, "ingredients": [("Lomo de res", 300, "g"), ("Parmesano", 50, "g"), ("Rúcula", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Empanadas de Carne", "steps": "1. Preparar el relleno\n2. Armar las empanadas\n3. Sellar los bordes\n4. Hornear hasta dorar", "image": "https://mandolina.co/wp-content/uploads/2023/08/empanadas-espanolasx1080x550-1.png?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 12, "ingredients": [("Masa para empanadas", 500, "g"), ("Carne molida", 400, "g"), ("Cebolla", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Lasaña Boloñesa", "steps": "1. Preparar salsa boloñesa\n2. Hacer bechamel\n3. Armar capas\n4. Hornear 45 min", "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 8, "ingredients": [("Pasta lasaña", 500, "g"), ("Carne molida", 600, "g"), ("Queso mozzarella", 300, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7,"title": "Churrasco Argentino", "steps": "1. Sazonar corte de carne\n2. Asar a la parrilla\n3. Dejar reposar 5 min\n4. Servir con chimichurri", "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Churrasco", 800, "g"), ("Chimichurri", 100, "ml"), ("Sal gruesa", 20, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Carne Asada a la Parrilla", "steps": "1. Marinar carne 2 horas\n2. Calentar parrilla\n3. Asar 4 min por lado\n4. Servir con guarnición", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 6, "ingredients": [("Carne de res", 1000, "g"), ("Limón", 2, "unidades"), ("Ajo", 4, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Albóndigas en Salsa", "steps": "1. Formar albóndigas\n2. Dorar en sartén\n3. Preparar salsa de tomate\n4. Cocinar juntos 20 min", "image": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Carne molida", 500, "g"), ("Tomate", 6, "unidades"), ("Pan rallado", 80, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 7, "title": "Filete Wellington", "steps": "1. Sellar filete de res\n2. Cubrir con paté y champiñones\n3. Envolver en hojaldre\n4. Hornear 200°C por 25 min", "image": "https://plus.unsplash.com/premium_photo-1668616815106-2fb55768587c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 80, "portions": 4, "ingredients": [("Filete de res", 800, "g"), ("Hojaldre", 400, "g"), ("Champiñón", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},


# CATEGORÍA 9: COMIDA VEGETARIANA (12 recetas)

    {"category_index": 8, "title": "Curry de Garbanzos", "steps": "1. Sofreír especias\n2. Añadir tomate y garbanzos\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Garbanzo", 400, "g"), ("Leche de coco", 400, "ml"), ("Tomate", 3, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Hummus Clásico", "steps": "1. Remojar garbanzos\n2. Cocinar hasta suaves\n3. Licuar con tahini y limón\n4. Servir con aceite", "image": "https://images.unsplash.com/photo-1568625365131-079e026a927d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Garbanzo", 400, "g"), ("Tahini", 100, "g"), ("Limón", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Spring Rolls Vegetales", "steps": "1. Remojar papel de arroz\n2. Rellenar con vegetales\n3. Enrollar firmemente\n4. Servir con salsa", "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Papel de arroz", 16, "unidades"), ("Zanahoria", 2, "unidades"), ("Lechuga", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Champiñones Rellenos", "steps": "1. Limpiar champiñones\n2. Preparar relleno de queso\n3. Rellenar y hornear\n4. Gratinar 15 minutos", "image": "https://images.unsplash.com/photo-1577594990850-e843a8e91512?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 8, "ingredients": [("Champiñón grande", 12, "unidades"), ("Queso crema", 150, "g"), ("Pan rallado", 50, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Tostadas de Aguacate", "steps": "1. Tostar pan\n2. Machacar aguacate\n3. Añadir limón\n4. Servir con sal", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Pan", 4, "rebanadas"), ("Aguacate", 1, "unidades"), ("Limón", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Ensalada de Quinoa", "steps": "1. Cocer quinoa\n2. Picar vegetales frescos\n3. Mezclar con vinagreta\n4. Añadir nueces", "image": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Quinoa", 200, "g"), ("Tomate cherry", 150, "g"), ("Pepino", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Risotto de Hongos", "steps": "1. Saltear hongos\n2. Tostar arroz arborio\n3. Añadir caldo poco a poco\n4. Terminar con parmesano", "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 45, "portions": 4, "ingredients": [("Arroz arborio", 300, "g"), ("Champiñón", 250, "g"), ("Queso parmesano", 80, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Pizza Margherita", "steps": "1. Preparar la masa\n2. Añadir salsa de tomate\n3. Agregar mozzarella\n4. Hornear 15 min", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 4, "ingredients": [("Harina", 300, "g"), ("Mozzarella", 200, "g"), ("Tomate", 3, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Berenjena a la Parmesana", "steps": "1. Cortar y freír berenjenas\n2. Preparar salsa de tomate\n3. Armar capas con queso\n4. Hornear 30 min", "image": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 55, "portions": 6, "ingredients": [("Berenjena", 3, "unidades"), ("Mozzarella", 300, "g"), ("Tomate", 6, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Falafel", "steps": "1. Remojar garbanzos\n2. Moler con especias\n3. Formar bolitas\n4. Freír hasta dorar", "image": "https://plus.unsplash.com/premium_photo-1663853051660-91bd9b822799?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 6, "ingredients": [("Garbanzo", 400, "g"), ("Cilantro", 50, "g"), ("Comino", 15, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Buddha Bowl", "steps": "1. Cocinar quinoa\n2. Preparar vegetales asados\n3. Añadir legumbres\n4. Servir con tahini", "image": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 2, "ingredients": [("Quinoa", 150, "g"), ("Batata", 200, "g"), ("Garbanzo", 150, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 8, "title": "Tacos Vegetarianos", "steps": "1. Saltear frijoles negros\n2. Preparar vegetales\n3. Calentar tortillas\n4. Armar con guacamole", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Frijol negro", 300, "g"), ("Tortilla", 8, "unidades"), ("Aguacate", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},

# CATEGORÍA 10: POSTRES (12 recetas)

    {"category_index": 9, "title": "Brownies de Chocolate", "steps": "1. Derretir chocolate\n2. Mezclar ingredientes\n3. Verter en molde\n4. Hornear 25 min", "image": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 12, "ingredients": [("Chocolate", 200, "g"), ("Mantequilla", 150, "g"), ("Azúcar", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Tiramisú Italiano", "steps": "1. Preparar crema de mascarpone\n2. Mojar bizcochos en café\n3. Armar capas\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Mascarpone", 500, "g"), ("Bizcocho", 300, "g"), ("Café", 300, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Flan de Caramelo", "steps": "1. Hacer caramelo\n2. Mezclar huevos con leche\n3. Verter en molde\n4. Hornear a baño maría", "image": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 8, "ingredients": [("Huevo", 6, "unidades"), ("Leche", 500, "ml"), ("Azúcar", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Cheesecake New York", "steps": "1. Hacer base de galleta\n2. Preparar mezcla de queso\n3. Hornear a baja temperatura\n4. Refrigerar toda la noche", "image": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 12, "ingredients": [("Queso crema", 600, "g"), ("Galleta", 200, "g"), ("Azúcar", 150, "g")],"auto_rating": 3, "rating_count": 23, "make_favorite": False},
    
    {"category_index": 9, "title": "Mousse de Chocolate", "steps": "1. Derretir chocolate\n2. Batir claras a punto de nieve\n3. Mezclar con cuidado\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 6, "ingredients": [("Chocolate", 200, "g"), ("Huevo", 4, "unidades"), ("Azúcar", 50, "g")],"auto_rating": 3, "rating_count": 1, "make_favorite": False},
    
    {"category_index": 9, "title": "Pancakes Esponjosos", "steps": "1. Mezclar ingredientes secos\n2. Añadir húmedos\n3. Cocinar en sartén\n4. Servir con miel", "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Harina", 200, "g"), ("Leche", 250, "ml"), ("Huevo", 2, "unidades")],"auto_rating": 3, "rating_count": 20, "make_favorite": False},
    
    {"category_index": 9, "title": "Crème Brûlée", "steps": "1. Mezclar crema con yemas\n2. Añadir vainilla\n3. Hornear a baño maría\n4. Caramelizar azúcar encima", "image": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 50, "portions": 6, "ingredients": [("Crema", 500, "ml"), ("Yema de huevo", 6, "unidades"), ("Azúcar", 150, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Tarta de Manzana", "steps": "1. Preparar masa quebrada\n2. Cortar manzanas en láminas\n3. Armar tarta\n4. Hornear 40 min", "image": "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 65, "portions": 8, "ingredients": [("Manzana", 6, "unidades"), ("Harina", 250, "g"), ("Mantequilla", 120, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Helado de Vainilla Casero", "steps": "1. Calentar leche y crema\n2. Mezclar con yemas\n3. Enfriar completamente\n4. Batir en heladera", "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 8, "ingredients": [("Crema", 400, "ml"), ("Leche", 300, "ml"), ("Vainilla", 2, "unidades")],"auto_rating": 3, "rating_count": 50, "make_favorite": False},
    
    {"category_index": 9, "title": "Galletas con Chispas de Chocolate", "steps": "1. Mezclar mantequilla con azúcar\n2. Añadir harina y chispas\n3. Formar galletas\n4. Hornear 12 min", "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 24, "ingredients": [("Harina", 300, "g"), ("Mantequilla", 150, "g"), ("Chispas de chocolate", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9, "title": "Tres Leches", "steps": "1. Hornear bizcocho\n2. Perforar con tenedor\n3. Bañar con mezcla de leches\n4. Cubrir con merengue", "image": "https://images.unsplash.com/photo-1673974798330-23e8f4c9ae05?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 12, "ingredients": [("Leche evaporada", 400, "ml"), ("Leche condensada", 400, "ml"), ("Crema", 200, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 9,"title": "Churros con Chocolate", "steps": "1. Preparar masa de churros\n2. Freír en aceite caliente\n3. Rebozar en azúcar\n4. Servir con chocolate caliente", "image": "https://plus.unsplash.com/premium_photo-1714180194796-8cb272b0bfed?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 6, "ingredients": [("Harina", 250, "g"), ("Chocolate", 150, "g"), ("Azúcar", 100, "g")],"auto_rating": 5, "rating_count": 30, "make_favorite": True},


# CATEGORÍA 11: DESAYUNOS Y BRUNCH (11 recetas)

    {"category_index": 10, "title": "Pancakes Esponjosos", "steps": "1. Mezclar ingredientes secos\n2. Añadir húmedos\n3. Cocinar en sartén\n4. Servir con miel", "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Harina", 200, "g"), ("Leche", 250, "ml"), ("Huevo", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Tostadas de Aguacate", "steps": "1. Tostar pan\n2. Machacar aguacate\n3. Añadir limón\n4. Servir con sal", "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Pan", 4, "rebanadas"), ("Aguacate", 1, "unidades"), ("Limón", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Huevos Benedictinos", "steps": "1. Tostar muffins ingleses\n2. Preparar huevos pochados\n3. Hacer salsa holandesa\n4. Armar y servir", "image": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 30, "portions": 2, "ingredients": [("Muffin inglés", 2, "unidades"), ("Huevo", 4, "unidades"), ("Mantequilla", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Omelette de Queso", "steps": "1. Batir huevos\n2. Cocinar en sartén\n3. Añadir queso\n4. Doblar y servir", "image": "https://images.unsplash.com/photo-1710024893503-2c91534d284a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 12, "portions": 2, "ingredients": [("Huevo", 4, "unidades"), ("Queso cheddar", 80, "g"), ("Mantequilla", 20, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "French Toast", "steps": "1. Batir huevos con leche\n2. Remojar pan\n3. Freír hasta dorar\n4. Servir con azúcar", "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Pan", 8, "rebanadas"), ("Huevo", 3, "unidades"), ("Leche", 150, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Waffles Belgas", "steps": "1. Mezclar ingredientes\n2. Precalentar waflera\n3. Verter masa\n4. Cocinar hasta dorar", "image": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 6, "ingredients": [("Harina", 250, "g"), ("Leche", 300, "ml"), ("Huevo", 2, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Burrito de Desayuno", "steps": "1. Revolver huevos\n2. Añadir tocino y queso\n3. Calentar tortilla\n4. Enrollar", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 18, "portions": 2, "ingredients": [("Tortilla de harina", 2, "unidades"), ("Huevo", 4, "unidades"), ("Tocino", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    { "category_index": 10,"title": "Smoothie Bowl", "steps": "1. Licuar frutas congeladas\n2. Añadir yogurt\n3. Servir en bowl\n4. Decorar con granola", "image": "https://images.unsplash.com/photo-1610450624105-58a2f25f7911?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Banana congelada", 2, "unidades"), ("Fresa", 150, "g"), ("Yogurt", 200, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Bagel con Salmón", "steps": "1. Tostar bagel\n2. Untar queso crema\n3. Añadir salmón ahumado\n4. Decorar con alcaparras", "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 8, "portions": 2, "ingredients": [("Bagel", 2, "unidades"), ("Salmón ahumado", 100, "g"), ("Queso crema", 80, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Chilaquiles Verdes", "steps": "1. Freír tortillas cortadas\n2. Preparar salsa verde\n3. Bañar totopos con salsa\n4. Servir con crema y queso", "image": "https://mandolina.co/wp-content/uploads/2020/11/comidas-mexicanas-recetas.jpg?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tortilla", 10, "unidades"), ("Tomate verde", 400, "g"), ("Crema", 100, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 10, "title": "Molletes Mexicanos", "steps": "1. Tostar bolillo\n2. Untar frijoles\n3. Cubrir con queso\n4. Gratinar", "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Bolillo", 4, "unidades"), ("Frijol refritos", 300, "g"), ("Queso Oaxaca", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},


# CATEGORÍA 12: BOCADILLOS Y APERITIVOS (13 recetas)

    {"category_index": 11, "title": "Empanadas de Queso", "steps": "1. Preparar masa\n2. Rellenar con queso\n3. Sellar bordes\n4. Freír hasta dorar", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 10, "ingredients": [("Masa", 500, "g"), ("Queso mozzarella", 300, "g"), ("Cebolla", 1, "unidades")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Bruschetta Italiana", "steps": "1. Tostar pan italiano\n2. Frotar con ajo\n3. Picar tomate con albahaca\n4. Montar sobre el pan", "image": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 6, "ingredients": [("Pan italiano", 1, "unidades"), ("Tomate", 4, "unidades"), ("Albahaca", 20, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Croquetas de Jamón", "steps": "1. Hacer bechamel espesa\n2. Añadir jamón picado\n3. Enfriar y formar\n4. Empanizar y freír", "image": "https://imag.bonviveur.com/croquetas-de-jamon-y-queso.webp?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 20, "ingredients": [("Jamón", 200, "g"), ("Harina", 100, "g"), ("Leche", 500, "ml")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Tabla de Quesos", "steps": "1. Seleccionar variedad de quesos\n2. Acompañar con frutas\n3. Añadir frutos secos\n4. Servir con pan", "image": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 6, "ingredients": [("Queso variado", 500, "g"), ("Uva", 200, "g"), ("Nuez", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Pinchos Caprese", "steps": "1. Cortar tomate y mozzarella\n2. Insertar en palillos\n3. Añadir albahaca\n4. Rociar con balsámico", "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 8, "ingredients": [("Tomate cherry", 20, "unidades"), ("Mozzarella", 200, "g"), ("Albahaca", 30, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Alitas Buffalo", "steps": "1. Hornear las alitas\n2. Preparar salsa buffalo\n3. Bañar alitas en salsa\n4. Servir con aderezo ranch", "image": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Alitas de pollo", 1000, "g"), ("Salsa picante", 150, "ml"), ("Mantequilla", 80, "g")],"auto_rating": 3, "rating_count": 15, "make_favorite": False},
    
    {"category_index": 11, "title": "Nachos con Queso", "steps": "1. Extender totopos\n2. Cubrir con queso cheddar\n3. Gratinar en horno\n4. Añadir jalapeños", "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Totopos", 300, "g"), ("Queso cheddar", 200, "g"), ("Jalapeño", 3, "unidades")],"auto_rating": 5, "rating_count": 13, "make_favorite": True},
    
    {"category_index": 11, "title": "Spring Rolls Vegetales", "steps": "1. Remojar papel de arroz\n2. Rellenar con vegetales\n3. Enrollar firmemente\n4. Servir con salsa", "image": "https://plus.unsplash.com/premium_photo-1663850685202-7ef603771118?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Papel de arroz", 16, "unidades"), ("Zanahoria", 2, "unidades"), ("Lechuga", 100, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Dedos de Queso Mozzarella", "steps": "1. Cortar mozzarella en bastones\n2. Empanar con pan rallado\n3. Congelar 20 min\n4. Freír hasta dorar", "image": "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 6, "ingredients": [("Mozzarella", 400, "g"), ("Pan rallado", 150, "g"), ("Huevo", 2, "unidades")],"auto_rating": 5, "rating_count": 34, "make_favorite": False},
    
    {"category_index": 11, "title": "Guacamole con Totopos", "steps": "1. Machacar aguacates\n2. Añadir tomate y cebolla\n3. Agregar cilantro y limón\n4. Servir con totopos", "image": "https://plus.unsplash.com/premium_photo-1681406689566-98c727aedda2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 12, "portions": 6, "ingredients": [("Aguacate", 3, "unidades"), ("Tomate", 2, "unidades"), ("Totopos", 200, "g")],"auto_rating": 3, "rating_count": 13, "make_favorite": False},
    
    {"category_index": 11, "title": "Dip de Espinacas", "steps": "1. Cocinar espinacas\n2. Mezclar con queso crema\n3. Añadir ajo y especias\n4. Hornear hasta burbujeante", "image": "https://plus.unsplash.com/premium_photo-1664472700331-78d01345b6d7?q=80&w=1008&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 8, "ingredients": [("Espinaca", 400, "g"), ("Queso crema", 250, "g"), ("Ajo", 3, "unidades")],"auto_rating": 5, "rating_count": 67, "make_favorite": False},
    
    {"category_index": 11, "title": "Mini Quiches", "steps": "1. Preparar masa quebrada\n2. Forrar moldes pequeños\n3. Rellenar con huevo y queso\n4. Hornear 20 min", "image": "https://images.unsplash.com/photo-1591985666643-1ecc67616216?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 12, "ingredients": [("Masa quebrada", 300, "g"), ("Huevo", 4, "unidades"), ("Queso gruyere", 150, "g")],"auto_rating": 4, "rating_count": 72, "make_favorite": False},
    
    {"category_index": 11, "title": "Tzatziki con Pan Pita", "steps": "1. Rallar pepino\n2. Mezclar con yogurt griego\n3. Añadir ajo y eneldo\n4. Servir con pan pita", "image": "https://plus.unsplash.com/premium_photo-1667215177072-6539146bc577?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 6, "ingredients": [("Yogurt griego", 400, "g"), ("Pepino", 2, "unidades"), ("Pan pita", 6, "unidades")],"auto_rating": 4, "rating_count": 5, "make_favorite": False},


# # Lista completa de todas las recetas organizadas
# TODAS_LAS_RECETAS = {
#     "pastas_italianas": PASTAS_ITALIANAS,
#     "sopas_y_cremas": SOPAS_Y_CREMAS,
#     "ensaladas": ENSALADAS,
#     "platos_con_pollo": PLATOS_CON_POLLO,
#     "comida_mexicana": COMIDA_MEXICANA,
#     "comida_asiatica": COMIDA_ASIATICA,
#     "mariscos_y_pescados": MARISCOS_Y_PESCADOS,
#     "carnes_rojas": CARNES_ROJAS,
#     "comida_vegetariana": COMIDA_VEGETARIANA,
#     "postres": POSTRES,
#     "desayunos_y_brunch": DESAYUNOS_Y_BRUNCH,
#     "bocadillos_y_aperitivos": BOCADILLOS_Y_APERITIVOS
# }

]


def get_or_create_ingredient(name):
    ingredient = Ingredient.query.filter_by(name=name).first()
    if not ingredient:
        ingredient = Ingredient(name=name, calories_per_100=50,
                                protein_per_100=2, carbs_per_100=10, fat_per_100=1)
        db.session.add(ingredient)
        db.session.flush()
    return ingredient


def map_unit(unit_str):
    unit_map = {"g": UnitEnum.GRAMS, "ml": UnitEnum.MILLILITERS,
                "unidades": UnitEnum.UNITS, "kg": UnitEnum.KILOGRAMS, "l": UnitEnum.LITERS}
    return unit_map.get(unit_str, UnitEnum.GRAMS)


def create_auto_ratings(recipe, rating_value, count, main_user_id):
    """Crea calificaciones automáticas para una receta"""
    # Obtener todos los usuarios excepto el principal
    all_users = User.query.filter(User.id_user != main_user_id).limit(count).all()
    
    for i, user in enumerate(all_users):
        # Variar un poco la calificación (entre rating_value y rating_value-1)
        varied_rating = rating_value if i % 2 == 0 else max(rating_value - 1, 4)
        
        rating = RecipeRating(
            value=varied_rating,
            comment=None,  # Sin comentarios automáticos
            user_id=user.id_user,
            recipe_id=recipe.id_recipe
        )
        db.session.add(rating)
    
    db.session.flush()
    
    # Calcular el promedio y actualizar la receta
    all_ratings = RecipeRating.query.filter_by(recipe_id=recipe.id_recipe).all()
    if all_ratings:
        total = sum(r.value for r in all_ratings)
        recipe.avg_rating = total / len(all_ratings)
        recipe.vote_count = len(all_ratings)


def seed_recipes():
    with app.app_context():
        categories = Category.query.all()
        if not categories:
            print(" No hay categorías. Crea al menos una categoría primero.")
            return

        main_user = User.query.first()
        if not main_user:
            print(" No hay usuarios. Crea al menos un usuario primero.")
            return
        
        # Verificar que hay más usuarios para las calificaciones
        user_count = User.query.count()
        if user_count < 5:
            print("Se recomienda tener al menos 5 usuarios para calificaciones variadas")

        print(f"Usando usuario principal: {main_user.username}")
        print(f" Categorías: {[c.name_category for c in categories]}")

        created_count = 0

        for i, recipe_data in enumerate(RECIPES_DATA):
            existing = Recipe.query.filter_by(title=recipe_data["title"]).first()
            if existing:
                print(f"Saltando '{recipe_data['title']}' (ya existe)")
                continue

            category = categories[recipe_data["category_index"]]

            # Crear receta
            recipe = Recipe(
                title=recipe_data["title"],
                steps=recipe_data["steps"],
                image=recipe_data["image"],
                difficulty=recipe_data["difficulty"],
                preparation_time_min=recipe_data["prep_time"],
                portions=recipe_data["portions"],
                state_recipe=stateRecipeEnum.PUBLISHED,
                user_id=main_user.id_user,
                category_id=category.id_category
            )
            db.session.add(recipe)
            db.session.flush()

            # Crear ingredientes
            for ing_name, quantity, unit in recipe_data["ingredients"]:
                ingredient = get_or_create_ingredient(ing_name)
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe.id_recipe,
                    ingredient_catalog_id=ingredient.id_ingredient,
                    quantity=quantity,
                    unit_measure=map_unit(unit)
                )
                db.session.add(recipe_ingredient)

            #  CREAR CALIFICACIONES AUTOMÁTICAS (si está definido)
            if "auto_rating" in recipe_data and recipe_data["auto_rating"]:
                rating_value = recipe_data["auto_rating"]
                rating_count = recipe_data.get("rating_count", 5)
                
                if user_count >= rating_count:
                    create_auto_ratings(recipe, rating_value, rating_count, main_user.id_user)
                    print(f"Añadidas {rating_count} calificaciones (~{rating_value} estrellas)")

            #  CREAR FAVORITO AUTOMÁTICO (si está definido)
            if recipe_data.get("make_favorite", False):
                favorite = RecipeFavorite(
                    user_id=main_user.id_user,
                    recipe_id=recipe.id_recipe
                )
                db.session.add(favorite)
                print(f"  Marcada como favorita")

            created_count += 1
            print(f"Creada: '{recipe_data['title']}' en '{category.name_category}'")

        db.session.commit()
        print(f"\ ¡Listo! Se crearon {created_count} recetas nuevas.")


if __name__ == "__main__":
    seed_recipes()