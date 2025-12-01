"""
Script para crear recetas de prueba(40 recetas).
Ejecutar con: cd src y  pipenv run python seed_recipes.py
"""

from api.models import db, Recipe, Ingredient, RecipeIngredient, Category, User, difficultyEnum, stateRecipeEnum, UnitEnum
from app import app

# Datos de recetas de prueba 
RECIPES_DATA = [
    {"title": "Pasta Carbonara Clásica", "steps": "1. Cocinar la pasta al dente\n2. Freír el tocino\n3. Mezclar huevos con queso\n4. Combinar todo", "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Pasta", 400, "g"), ("Tocino", 200, "g"), ("Huevo", 3, "unidades")]},
    {"title": "Ensalada César", "steps": "1. Lavar la lechuga\n2. Preparar el aderezo\n3. Agregar crutones\n4. Mezclar todo", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 2, "ingredients": [("Lechuga", 200, "g"), ("Pollo", 150, "g"), ("Queso parmesano", 50, "g")]},
    {"title": "Tacos de Carne Asada", "steps": "1. Marinar la carne\n2. Asar a la parrilla\n3. Cortar en tiras\n4. Servir en tortillas", "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 6, "ingredients": [("Carne de res", 500, "g"), ("Tortilla", 12, "unidades"), ("Cebolla", 1, "unidades")]},
    {"title": "Sopa de Tomate", "steps": "1. Asar los tomates\n2. Licuar con ajo\n3. Cocinar a fuego lento\n4. Servir con crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tomate", 6, "unidades"), ("Ajo", 3, "unidades"), ("Crema", 100, "ml")]},
    {"title": "Pollo al Curry", "steps": "1. Dorar el pollo\n2. Añadir curry y especias\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Curry", 30, "g"), ("Leche de coco", 400, "ml")]},
    {"title": "Pizza Margherita", "steps": "1. Preparar la masa\n2. Añadir salsa de tomate\n3. Agregar mozzarella\n4. Hornear 15 min", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 4, "ingredients": [("Harina", 300, "g"), ("Mozzarella", 200, "g"), ("Tomate", 3, "unidades")]},
    {"title": "Brownies de Chocolate", "steps": "1. Derretir chocolate\n2. Mezclar ingredientes\n3. Verter en molde\n4. Hornear 25 min", "image": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 12, "ingredients": [("Chocolate", 200, "g"), ("Mantequilla", 150, "g"), ("Azúcar", 200, "g")]},
    {"title": "Ceviche de Camarón", "steps": "1. Limpiar camarones\n2. Marinar en limón\n3. Agregar verduras\n4. Refrigerar 30 min", "image": "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Camarón", 500, "g"), ("Limón", 8, "unidades"), ("Cebolla morada", 1, "unidades")]},
    {"title": "Arroz con Pollo", "steps": "1. Dorar el pollo\n2. Sofreír verduras\n3. Añadir arroz y caldo\n4. Cocinar 25 min", "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 800, "g"), ("Zanahoria", 2, "unidades")]},
    {"title": "Hamburguesa Clásica", "steps": "1. Formar las carnes\n2. Asar a la parrilla\n3. Tostar el pan\n4. Armar con vegetales", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Carne molida", 500, "g"), ("Pan de hamburguesa", 4, "unidades"), ("Queso cheddar", 4, "unidades")]},
    {"title": "Lasaña Boloñesa", "steps": "1. Preparar salsa boloñesa\n2. Hacer bechamel\n3. Armar capas\n4. Hornear 45 min", "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 8, "ingredients": [("Pasta lasaña", 500, "g"), ("Carne molida", 600, "g"), ("Queso mozzarella", 300, "g")]},
    {"title": "Sushi Roll California", "steps": "1. Preparar arroz de sushi\n2. Extender en nori\n3. Rellenar y enrollar\n4. Cortar en piezas", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 4, "ingredients": [("Arroz para sushi", 300, "g"), ("Cangrejo", 200, "g"), ("Aguacate", 2, "unidades")]},
    {"title": "Pancakes Esponjosos", "steps": "1. Mezclar ingredientes secos\n2. Añadir húmedos\n3. Cocinar en sartén\n4. Servir con miel", "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Harina", 200, "g"), ("Leche", 250, "ml"), ("Huevo", 2, "unidades")]},
    {"title": "Paella Valenciana", "steps": "1. Sofreír carnes\n2. Añadir verduras\n3. Incorporar arroz y caldo\n4. Cocinar sin revolver", "image": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 75, "portions": 6, "ingredients": [("Arroz", 400, "g"), ("Pollo", 400, "g"), ("Mariscos", 300, "g")]},
    {"title": "Tiramisú Italiano", "steps": "1. Preparar crema de mascarpone\n2. Mojar bizcochos en café\n3. Armar capas\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Mascarpone", 500, "g"), ("Bizcocho", 300, "g"), ("Café", 300, "ml")]},
    {"title": "Wrap de Pollo", "steps": "1. Cocinar el pollo\n2. Cortar verduras\n3. Calentar tortilla\n4. Enrollar con ingredientes", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 2, "ingredients": [("Pollo", 200, "g"), ("Tortilla de harina", 2, "unidades"), ("Lechuga", 50, "g")]},
    {"title": "Crema de Champiñones", "steps": "1. Saltear champiñones\n2. Añadir caldo\n3. Licuar hasta cremoso\n4. Añadir crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Champiñón", 400, "g"), ("Crema", 200, "ml"), ("Cebolla", 1, "unidades")]},
    {"title": "Costillas BBQ", "steps": "1. Marinar costillas\n2. Hornear tapadas 2 horas\n3. Añadir salsa BBQ\n4. Gratinar 15 min", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 150, "portions": 4, "ingredients": [("Costillas de cerdo", 1000, "g"), ("Salsa BBQ", 250, "ml"), ("Miel", 50, "ml")]},
    {"title": "Smoothie de Frutas", "steps": "1. Cortar frutas\n2. Añadir yogurt\n3. Licuar todo\n4. Servir frío", "image": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 5, "portions": 2, "ingredients": [("Fresa", 150, "g"), ("Plátano", 1, "unidades"), ("Yogurt", 200, "ml")]},
    {"title": "Enchiladas Verdes", "steps": "1. Preparar salsa verde\n2. Rellenar tortillas con pollo\n3. Bañar con salsa\n4. Gratinar con queso", "image": "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Tortilla", 8, "unidades"), ("Pollo", 400, "g"), ("Tomate verde", 500, "g")]},
    {"title": "Risotto de Hongos", "steps": "1. Saltear hongos\n2. Tostar arroz arborio\n3. Añadir caldo poco a poco\n4. Terminar con parmesano", "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 45, "portions": 4, "ingredients": [("Arroz arborio", 300, "g"), ("Champiñón", 250, "g"), ("Queso parmesano", 80, "g")]},
    {"title": "Fish and Chips", "steps": "1. Preparar masa para rebozar\n2. Freír el pescado\n3. Cortar y freír papas\n4. Servir con salsa tártara", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 4, "ingredients": [("Pescado blanco", 600, "g"), ("Papa", 800, "g"), ("Harina", 200, "g")]},
    {"title": "Flan de Caramelo", "steps": "1. Hacer caramelo\n2. Mezclar huevos con leche\n3. Verter en molde\n4. Hornear a baño maría", "image": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 8, "ingredients": [("Huevo", 6, "unidades"), ("Leche", 500, "ml"), ("Azúcar", 200, "g")]},
    {"title": "Pad Thai", "steps": "1. Remojar fideos de arroz\n2. Saltear con huevo y tofu\n3. Añadir salsa pad thai\n4. Servir con cacahuates", "image": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 4, "ingredients": [("Fideos de arroz", 300, "g"), ("Huevo", 2, "unidades"), ("Cacahuate", 50, "g")]},
    {"title": "Empanadas de Carne", "steps": "1. Preparar el relleno\n2. Armar las empanadas\n3. Sellar los bordes\n4. Hornear hasta dorar", "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 12, "ingredients": [("Masa para empanadas", 500, "g"), ("Carne molida", 400, "g"), ("Cebolla", 2, "unidades")]},
    {"title": "Gazpacho Andaluz", "steps": "1. Triturar tomates\n2. Añadir pepino y pimiento\n3. Agregar vinagre y aceite\n4. Refrigerar 2 horas", "image": "https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Tomate", 1000, "g"), ("Pepino", 1, "unidades"), ("Pimiento", 1, "unidades")]},
    {"title": "Cheesecake New York", "steps": "1. Hacer base de galleta\n2. Preparar mezcla de queso\n3. Hornear a baja temperatura\n4. Refrigerar toda la noche", "image": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 12, "ingredients": [("Queso crema", 600, "g"), ("Galleta", 200, "g"), ("Azúcar", 150, "g")]},
    {"title": "Tacos al Pastor", "steps": "1. Marinar cerdo con achiote\n2. Asar en trompo o sartén\n3. Cortar en trozos\n4. Servir con piña", "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 50, "portions": 6, "ingredients": [("Cerdo", 600, "g"), ("Piña", 200, "g"), ("Tortilla", 12, "unidades")]},
    {"title": "Sopa Minestrone", "steps": "1. Sofreír verduras\n2. Añadir caldo y tomate\n3. Agregar pasta y frijoles\n4. Cocinar 30 min", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 45, "portions": 6, "ingredients": [("Pasta corta", 150, "g"), ("Frijol", 200, "g"), ("Calabacín", 2, "unidades")]},
    {"title": "Burritos de Pollo", "steps": "1. Cocinar el pollo\n2. Preparar frijoles y arroz\n3. Calentar tortillas\n4. Armar y enrollar", "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 4, "ingredients": [("Pollo", 400, "g"), ("Tortilla de harina", 4, "unidades"), ("Frijol", 200, "g")]},
    {"title": "Pasta Alfredo", "steps": "1. Cocinar fettuccine\n2. Preparar salsa de crema\n3. Añadir parmesano\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fettuccine", 400, "g"), ("Crema", 300, "ml"), ("Queso parmesano", 100, "g")]},
    {"title": "Curry de Garbanzos", "steps": "1. Sofreír especias\n2. Añadir tomate y garbanzos\n3. Agregar leche de coco\n4. Cocinar 20 min", "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Garbanzo", 400, "g"), ("Leche de coco", 400, "ml"), ("Tomate", 3, "unidades")]},
    {"title": "Croquetas de Jamón", "steps": "1. Hacer bechamel espesa\n2. Añadir jamón picado\n3. Enfriar y formar\n4. Empanizar y freír", "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 20, "ingredients": [("Jamón", 200, "g"), ("Harina", 100, "g"), ("Leche", 500, "ml")]},
    {"title": "Ensalada Griega", "steps": "1. Cortar pepino y tomate\n2. Añadir aceitunas y cebolla\n3. Agregar queso feta\n4. Aliñar con aceite", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Pepino", 2, "unidades"), ("Tomate", 3, "unidades"), ("Queso feta", 150, "g")]},
    {"title": "Pollo a la Naranja", "steps": "1. Dorar el pollo\n2. Preparar salsa de naranja\n3. Bañar el pollo\n4. Hornear 20 min", "image": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Pollo", 600, "g"), ("Naranja", 4, "unidades"), ("Miel", 50, "ml")]},
    {"title": "Quesadillas de Queso", "steps": "1. Calentar tortilla\n2. Añadir queso\n3. Doblar y dorar\n4. Servir con guacamole", "image": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Tortilla de harina", 4, "unidades"), ("Queso Oaxaca", 200, "g"), ("Jalapeño", 2, "unidades")]},
    {"title": "Mousse de Chocolate", "steps": "1. Derretir chocolate\n2. Batir claras a punto de nieve\n3. Mezclar con cuidado\n4. Refrigerar 4 horas", "image": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 6, "ingredients": [("Chocolate", 200, "g"), ("Huevo", 4, "unidades"), ("Azúcar", 50, "g")]},
    {"title": "Ramen Japonés", "steps": "1. Preparar caldo dashi\n2. Cocinar fideos ramen\n3. Añadir cerdo y huevo\n4. Decorar con nori", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 120, "portions": 4, "ingredients": [("Fideos ramen", 400, "g"), ("Cerdo", 300, "g"), ("Huevo", 4, "unidades")]},
    {"title": "Bruschetta Italiana", "steps": "1. Tostar pan italiano\n2. Frotar con ajo\n3. Picar tomate con albahaca\n4. Montar sobre el pan", "image": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 6, "ingredients": [("Pan italiano", 1, "unidades"), ("Tomate", 4, "unidades"), ("Albahaca", 20, "g")]},
    {"title": "Croquetas de Jamón", "steps": "1. Hacer bechamel espesa\n2. Añadir jamón picado\n3. Enfriar y formar\n4. Empanizar y freír", "image": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 60, "portions": 20, "ingredients": [("Jamón", 200, "g"), ("Harina", 100, "g"), ("Leche", 500, "ml")]},
    {"title": "Hummus Clásico", "steps": "1. Remojar garbanzos\n2. Cocinar hasta suaves\n3. Licuar con tahini y limón\n4. Servir con aceite", "image": "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Garbanzo", 400, "g"), ("Tahini", 100, "g"), ("Limón", 2, "unidades")]},
    {"title": "Alitas Buffalo", "steps": "1. Hornear las alitas\n2. Preparar salsa buffalo\n3. Bañar alitas en salsa\n4. Servir con aderezo ranch", "image": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 45, "portions": 4, "ingredients": [("Alitas de pollo", 1000, "g"), ("Salsa picante", 150, "ml"), ("Mantequilla", 80, "g")]},
    {"title": "Spring Rolls Vegetales", "steps": "1. Remojar papel de arroz\n2. Rellenar con vegetales\n3. Enrollar firmemente\n4. Servir con salsa", "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 8, "ingredients": [("Papel de arroz", 16, "unidades"), ("Zanahoria", 2, "unidades"), ("Lechuga", 100, "g")]},
    {"title": "Nachos con Queso", "steps": "1. Extender totopos\n2. Cubrir con queso cheddar\n3. Gratinar en horno\n4. Añadir jalapeños", "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Totopos", 300, "g"), ("Queso cheddar", 200, "g"), ("Jalapeño", 3, "unidades")]},
    {"title": "Carpaccio de Res", "steps": "1. Congelar carne ligeramente\n2. Cortar en láminas finas\n3. Disponer en plato\n4. Aliñar con aceite y parmesano", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 4, "ingredients": [("Lomo de res", 300, "g"), ("Parmesano", 50, "g"), ("Rúcula", 100, "g")]},
    {"title": "Camarones al Ajillo", "steps": "1. Picar ajo finamente\n2. Saltear camarones\n3. Añadir vino blanco\n4. Terminar con perejil", "image": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 4, "ingredients": [("Camarón", 500, "g"), ("Ajo", 6, "unidades"), ("Vino blanco", 100, "ml")]},
    {"title": "Tabla de Quesos", "steps": "1. Seleccionar variedad de quesos\n2. Acompañar con frutas\n3. Añadir frutos secos\n4. Servir con pan", "image": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 6, "ingredients": [("Queso variado", 500, "g"), ("Uva", 200, "g"), ("Nuez", 100, "g")]},
    {"title": "Champiñones Rellenos", "steps": "1. Limpiar champiñones\n2. Preparar relleno de queso\n3. Rellenar y hornear\n4. Gratinar 15 minutos", "image": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 8, "ingredients": [("Champiñón grande", 12, "unidades"), ("Queso crema", 150, "g"), ("Pan rallado", 50, "g")]},
    {"title": "Tostadas de Atún", "steps": "1. Tostar pan de caja\n2. Mezclar atún con mayonesa\n3. Añadir cebolla picada\n4. Montar sobre tostadas", "image": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 4, "ingredients": [("Atún en lata", 300, "g"), ("Pan de caja", 8, "unidades"), ("Mayonesa", 80, "g")]},
    {"title": "Empanadas de Queso", "steps": "1. Preparar masa\n2. Rellenar con queso\n3. Sellar bordes\n4. Freír hasta dorar", "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 40, "portions": 10, "ingredients": [("Masa", 500, "g"), ("Queso mozzarella", 300, "g"), ("Cebolla", 1, "unidades")]},
    {"title": "Pinchos Caprese", "steps": "1. Cortar tomate y mozzarella\n2. Insertar en palillos\n3. Añadir albahaca\n4. Rociar con balsámico", "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 8, "ingredients": [("Tomate cherry", 20, "unidades"), ("Mozzarella", 200, "g"), ("Albahaca", 30, "g")]},
    {"title": "Sopa de Tomate", "steps": "1. Asar los tomates\n2. Licuar con ajo\n3. Cocinar a fuego lento\n4. Servir con crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Tomate", 6, "unidades"), ("Ajo", 3, "unidades"), ("Crema", 100, "ml")]},
    {"title": "Crema de Champiñones", "steps": "1. Saltear champiñones\n2. Añadir caldo\n3. Licuar hasta cremoso\n4. Añadir crema", "image": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Champiñón", 400, "g"), ("Crema", 200, "ml"), ("Cebolla", 1, "unidades")]},
    {"title": "Sopa Minestrone", "steps": "1. Sofreír verduras\n2. Añadir caldo y tomate\n3. Agregar pasta y frijoles\n4. Cocinar 30 min", "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 45, "portions": 6, "ingredients": [("Pasta corta", 150, "g"), ("Frijol", 200, "g"), ("Calabacín", 2, "unidades")]},
    {"title": "Gazpacho Andaluz", "steps": "1. Triturar tomates\n2. Añadir pepino y pimiento\n3. Agregar vinagre y aceite\n4. Refrigerar 2 horas", "image": "https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Tomate", 1000, "g"), ("Pepino", 1, "unidades"), ("Pimiento", 1, "unidades")]},
    {"title": "Sopa de Cebolla Francesa", "steps": "1. Caramelizar cebollas\n2. Añadir vino y caldo\n3. Servir en cazuelas\n4. Gratinar con queso", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 60, "portions": 4, "ingredients": [("Cebolla", 6, "unidades"), ("Queso gruyere", 200, "g"), ("Pan", 4, "unidades")]},
    {"title": "Crema de Calabaza", "steps": "1. Asar calabaza\n2. Licuar con caldo\n3. Añadir especias\n4. Terminar con crema", "image": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 6, "ingredients": [("Calabaza", 800, "g"), ("Caldo de verduras", 1000, "ml"), ("Crema", 150, "ml")]},
    {"title": "Sopa Wonton", "steps": "1. Preparar wontons\n2. Hacer caldo aromático\n3. Cocer wontons\n4. Servir con cebollín", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 50, "portions": 4, "ingredients": [("Masa wonton", 300, "g"), ("Cerdo molido", 250, "g"), ("Cebollín", 30, "g")]},
    {"title": "Sopa de Lentejas", "steps": "1. Remojar lentejas\n2. Sofreír verduras\n3. Añadir lentejas y caldo\n4. Cocinar 45 minutos", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 60, "portions": 6, "ingredients": [("Lenteja", 400, "g"), ("Zanahoria", 2, "unidades"), ("Chorizo", 150, "g")]},
    {"title": "Crema de Brócoli", "steps": "1. Cocer brócoli\n2. Licuar con caldo\n3. Añadir queso crema\n4. Servir con crutones", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Brócoli", 600, "g"), ("Queso crema", 100, "g"), ("Caldo", 800, "ml")]},
    {"title": "Sopa Tom Yum", "steps": "1. Hacer caldo picante\n2. Añadir camarones\n3. Agregar limón y cilantro\n4. Servir caliente", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Camarón", 400, "g"), ("Galanga", 30, "g"), ("Limón", 3, "unidades")]},
    {"title": "Pozole Rojo", "steps": "1. Cocer carne de cerdo\n2. Añadir maíz pozolero\n3. Preparar chile guajillo\n4. Servir con tostadas", "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 180, "portions": 10, "ingredients": [("Cerdo", 1500, "g"), ("Maíz pozolero", 800, "g"), ("Chile guajillo", 100, "g")]},
    {"title": "Crema de Espárragos", "steps": "1. Cocer espárragos\n2. Licuar con caldo\n3. Añadir crema\n4. Sazonar", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 30, "portions": 4, "ingredients": [("Espárrago", 500, "g"), ("Crema", 150, "ml"), ("Caldo", 700, "ml")]},
    {"title": "Sopa de Tortilla", "steps": "1. Freír tiras de tortilla\n2. Preparar caldo de tomate\n3. Servir con aguacate\n4. Añadir queso y crema", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 35, "portions": 6, "ingredients": [("Tortilla", 8, "unidades"), ("Tomate", 6, "unidades"), ("Aguacate", 2, "unidades")]},
    {"title": "Bisque de Langosta", "steps": "1. Saltear cáscaras\n2. Hacer base con tomate\n3. Licuar y colar\n4. Añadir crema y coñac", "image": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 4, "ingredients": [("Langosta", 800, "g"), ("Tomate", 400, "g"), ("Crema", 200, "ml")]},
    {"title": "Ensalada César", "steps": "1. Lavar la lechuga\n2. Preparar el aderezo\n3. Agregar crutones\n4. Mezclar todo", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 2, "ingredients": [("Lechuga", 200, "g"), ("Pollo", 150, "g"), ("Queso parmesano", 50, "g")]},
    {"title": "Ensalada Griega", "steps": "1. Cortar pepino y tomate\n2. Añadir aceitunas y cebolla\n3. Agregar queso feta\n4. Aliñar con aceite", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Pepino", 2, "unidades"), ("Tomate", 3, "unidades"), ("Queso feta", 150, "g")]},
    {"title": "Ensalada Caprese", "steps": "1. Cortar tomate y mozzarella\n2. Intercalar en plato\n3. Añadir albahaca fresca\n4. Rociar con aceite", "image": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Tomate", 3, "unidades"), ("Mozzarella", 250, "g"), ("Albahaca", 20, "g")]},
    {"title": "Ensalada de Quinoa", "steps": "1. Cocer quinoa\n2. Picar vegetales frescos\n3. Mezclar con vinagreta\n4. Añadir nueces", "image": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Quinoa", 200, "g"), ("Tomate cherry", 150, "g"), ("Pepino", 1, "unidades")]},
    {"title": "Ensalada Waldorf", "steps": "1. Cortar manzana y apio\n2. Añadir nueces\n3. Mezclar con mayonesa\n4. Servir sobre lechuga", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Manzana", 2, "unidades"), ("Apio", 3, "unidades"), ("Nuez", 100, "g")]},
    {"title": "Ensalada Nicoise", "steps": "1. Cocer huevos y papas\n2. Añadir atún y judías\n3. Agregar aceitunas\n4. Aliñar con vinagreta", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Atún", 300, "g"), ("Papa", 400, "g"), ("Huevo", 4, "unidades")]},
    {"title": "Ensalada de Espinacas", "steps": "1. Lavar espinacas\n2. Añadir fresas y nueces\n3. Agregar queso de cabra\n4. Aliñar con balsámico", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Espinaca", 200, "g"), ("Fresa", 150, "g"), ("Queso de cabra", 100, "g")]},
    {"title": "Ensalada Mediterránea", "steps": "1. Mezclar lechuga y rúcula\n2. Añadir tomate y pepino\n3. Agregar garbanzos\n4. Aliñar con limón", "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Lechuga mixta", 250, "g"), ("Garbanzo", 200, "g"), ("Pepino", 1, "unidades")]},
    {"title": "Ensalada Cobb", "steps": "1. Disponer lechuga de base\n2. Añadir pollo en tiras\n3. Agregar aguacate y tocino\n4. Servir con aderezo ranch", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 25, "portions": 4, "ingredients": [("Lechuga", 300, "g"), ("Pollo", 400, "g"), ("Aguacate", 2, "unidades")]},
    {"title": "Ensalada de Mango", "steps": "1. Cortar mango en cubos\n2. Añadir cebolla morada\n3. Agregar cilantro\n4. Aliñar con limón", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 4, "ingredients": [("Mango", 2, "unidades"), ("Cebolla morada", 1, "unidades"), ("Cilantro", 30, "g")]},
    {"title": "Ensalada de Lentejas", "steps": "1. Cocer lentejas\n2. Picar pimiento y cebolla\n3. Mezclar con vinagreta\n4. Servir fría", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 35, "portions": 6, "ingredients": [("Lenteja", 300, "g"), ("Pimiento", 2, "unidades"), ("Cebolla", 1, "unidades")]},
    {"title": "Ensalada de Col", "steps": "1. Rallar col y zanahoria\n2. Preparar aderezo cremoso\n3. Mezclar bien\n4. Refrigerar 30 min", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 15, "portions": 8, "ingredients": [("Col", 500, "g"), ("Zanahoria", 2, "unidades"), ("Mayonesa", 150, "ml")]},
    {"title": "Ensalada de Pasta", "steps": "1. Cocer pasta\n2. Añadir tomate y mozzarella\n3. Agregar albahaca\n4. Aliñar con pesto", "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 20, "portions": 6, "ingredients": [("Pasta corta", 400, "g"), ("Tomate cherry", 200, "g"), ("Mozzarella", 200, "g")]},
    {"title": "Ensalada de Remolacha", "steps": "1. Cocer remolachas\n2. Cortar en cubos\n3. Añadir queso de cabra\n4. Aliñar con vinagreta", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 40, "portions": 4, "ingredients": [("Remolacha", 4, "unidades"), ("Queso de cabra", 150, "g"), ("Nuez", 80, "g")]},
    {"title": "Ensalada de Atún", "steps": "1. Mezclar atún con maíz\n2. Añadir lechuga picada\n3. Agregar tomate\n4. Aliñar con mayonesa", "image": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 10, "portions": 2, "ingredients": [("Atún en lata", 300, "g"), ("Maíz", 200, "g"), ("Lechuga", 150, "g")]},
    {"title": "Pasta Carbonara Clásica", "steps": "1. Cocinar la pasta al dente\n2. Freír el tocino\n3. Mezclar huevos con queso\n4. Combinar todo", "image": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80",
        "difficulty": difficultyEnum.MEDIUM, "prep_time": 30, "portions": 4, "ingredients": [("Pasta", 400, "g"), ("Tocino", 200, "g"), ("Huevo", 3, "unidades")]},
    {"title": "Pasta Alfredo", "steps": "1. Cocinar fettuccine\n2. Preparar salsa de crema\n3. Añadir parmesano\n4. Mezclar con pasta", "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80",
        "difficulty": difficultyEnum.EASY, "prep_time": 25, "portions": 4, "ingredients": [("Fettuccine", 400, "g"), ("Crema", 300, "ml"), ("Queso parmesano", 100, "g")]},
    {"title": "Lasaña Boloñesa", "steps": "1. Preparar salsa boloñesa\n2. Hacer bechamel\n3. Armar capas\n4. Hornear 45 min", "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80",
        "difficulty": difficultyEnum.DIFFICULT, "prep_time": 90, "portions": 8, "ingredients": [("Pasta lasaña", 500, "g"), ("Carne molida", 600, "g"), ("Queso mozzarella", 300, "g")]},

    {"title": "Salteado de Vegetales Asiáticos",
     "steps": "1. Cortar vegetales\n2. Saltear con salsa soya\n3. Agregar jengibre\n4. Servir caliente",
     "image": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 15,
     "portions": 3,
     "ingredients": [("Zanahoria", 1, "unidad"), ("Brócoli", 200, "g"), ("Salsa soya", 30, "ml")]},

    {"title": "Ensalada de Frutas Tropical",
     "steps": "1. Cortar frutas\n2. Mezclar en bowl\n3. Añadir miel\n4. Refrigerar",
     "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 10,
     "portions": 4,
     "ingredients": [("Piña", 200, "g"), ("Mango", 1, "unidad"), ("Banano", 1, "unidad")]},


    {"title": "Pollo al Limón y Romero",
     "steps": "1. Marinar pollo\n2. Sellar en sartén\n3. Añadir limón y romero\n4. Hornear 20 min",
     "image": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&q=80",
     "difficulty": difficultyEnum.MEDIUM,
     "prep_time": 40,
     "portions": 4,
     "ingredients": [("Pollo", 600, "g"), ("Limón", 2, "unidades"), ("Romero", 10, "g")]},

    {"title": "Fusilli con Salsa de Tomate y Albahaca",
     "steps": "1. Cocinar fusilli\n2. Preparar salsa de tomate\n3. Añadir albahaca\n4. Mezclar",
     "image": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 25,
     "portions": 4,
     "ingredients": [("Fusilli", 400, "g"), ("Tomate", 4, "unidades"), ("Albahaca", 20, "g")]},



    {"title": "Tostadas de Aguacate",
     "steps": "1. Tostar pan\n2. Machacar aguacate\n3. Añadir limón\n4. Servir con sal",
     "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 10,
     "portions": 2,
     "ingredients": [("Pan", 4, "rebanadas"), ("Aguacate", 1, "unidad"), ("Limón", 1, "unidad")]},


    {"title": "Sopa de Lentejas",
     "steps": "1. Remojar lentejas\n2. Cocinar con verduras\n3. Añadir condimentos\n4. Servir",
     "image": "https://images.unsplash.com/photo-1601050690431-8d3f5ad7881e?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 50,
     "portions": 5,
     "ingredients": [("Lentejas", 300, "g"), ("Zanahoria", 1, "unidad"), ("Cebolla", 1, "unidad")]},



    {"title": "Nachos con Queso",
     "steps": "1. Colocar nachos\n2. Añadir queso\n3. Hornear 10 min\n4. Servir con salsa",
     "image": "https://images.unsplash.com/photo-1617191511475-32e562e2eb06?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 12,
     "portions": 3,
     "ingredients": [("Nachos", 200, "g"), ("Queso", 150, "g"), ("Jalapeños", 2, "unidades")]},



    {"title": "Bistec con Papas",
     "steps": "1. Cocinar bistec\n2. Freír papas\n3. Sazonar\n4. Servir",
     "image": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 35,
     "portions": 3,
     "ingredients": [("Carne", 400, "g"), ("Papa", 500, "g"), ("Aceite", 20, "ml")]},


    {"title": "Batido de Chocolate",
     "steps": "1. Añadir ingredientes\n2. Licuar\n3. Servir frío\n4. Decorar con cacao",
     "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
     "difficulty": difficultyEnum.EASY,
     "prep_time": 5,
     "portions": 2,
     "ingredients": [("Leche", 300, "ml"), ("Cacao", 30, "g"), ("Azúcar", 20, "g")]},

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
        print(
            f"Categorías disponibles: {[c.name_category for c in categories]}")

        created_count = 0

        for i, recipe_data in enumerate(RECIPES_DATA):
            existing = Recipe.query.filter_by(
                title=recipe_data["title"]).first()
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
            print(
                f"Creada: '{recipe_data['title']}' en '{category.name_category}'")

        db.session.commit()
        print(f"\n ¡Listo! Se crearon {created_count} recetas nuevas.")


if __name__ == "__main__":
    seed_recipes()
