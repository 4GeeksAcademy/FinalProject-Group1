from tu_app_name import db, create_app 
from tu_app_name.api.models import User 
import os
from base64 import b64encode
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def create_initial_admin():
    
    app = create_app() 
    
    with app.app_context():
        
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@4geeks.com')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'Admin123*') 
        admin_username = os.environ.get('ADMIN_USERNAME', 'superadmin')
        admin_fullname = "Primer Administrador"
        admin_role = "administrador" # <-- ROL CLAVE
        
        if User.query.filter_by(email=admin_email).first() is None:
            salt = b64encode(os.urandom(16)).decode("utf-8")
            hashed_password = generate_password_hash(f"{admin_password}{salt}")
            
            foto_url = "https://ui-avatars.com/api/?name={}&size=128&background=random&rounded=true".format(
                admin_username
            )

            admin_user = User(
                email=admin_email,
                password=hashed_password,
                fullname=admin_fullname,
                username=admin_username,
                foto_perfil=foto_url,
                is_active=True,
                salt=salt,
                rol=admin_role 
            )

            db.session.add(admin_user)
            try:
                db.session.commit()
                print(f"✅ Primer administrador '{admin_email}' con rol '{admin_role}' creado exitosamente.")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error al crear administrador: {e}")
        else:
            print(f"ℹ️ El administrador '{admin_email}' ya existe. Saltando seeding.")

if __name__ == '__main__':
    create_initial_admin()