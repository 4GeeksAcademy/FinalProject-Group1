
import click
from api.models import db, User
from werkzeug.security import generate_password_hash
from base64 import b64encode
import os


"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

@app.cli.command("insert-test-data")
def insert_test_data():
        ADMIN_EMAIL = "admin@recetas.com"
        ADMIN_USERNAME = "admin_recetas"
        ADMIN_PASSWORD = "PasswordSeguraAdmin1!"
        if User.query.filter_by(email=ADMIN_EMAIL).first():
            print("El usuario administrador ya existe. Omitiendo la creación.")
            return

        print(f"Creando usuario administrador: {ADMIN_EMAIL}")
        salt_admin = b64encode(os.urandom(16)).decode("utf-8")
        hashed_password_admin = generate_password_hash(f"{ADMIN_PASSWORD}{salt_admin}")
        foto_url = "https://ui-avatars.com/api/?name=Admin&size=128&background=27ae60&rounded=true"
        admin_user = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            fullname="Administrador Recetas",
            rol="administrador",  
            password=hashed_password_admin,
            salt=salt_admin,
            foto_perfil=foto_url,
            is_active=True
        )
        db.session.add(admin_user)
        try:
            db.session.commit()
            print("✅ Usuario administrador creado exitosamente.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error al crear el usuario administrador: {e}")
pass