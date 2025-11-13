from datetime import datetime, timedelta
import secrets

# Almacenamiento temporal de tokens 
active_tokens = {}

def generate_token(user_id):
    # Generar token aleatorio
    token = secrets.token_urlsafe(32)
    expiration = datetime.now() + timedelta(hours=1)
    
    active_tokens[token] = {
        'user_id': user_id,
        'expiration': expiration
    }
    
    return token

def validate_token(token):
    # Retorna user_id si es válido, None si no
    if token not in active_tokens:
        return None
    
    token_data = active_tokens[token]
    
    if datetime.now() > token_data['expiration']:
        del active_tokens[token]
        return None
    
    return token_data['user_id']

def delete_token(token):
    # Eliminar token después de usarlo
    if token in active_tokens:
        del active_tokens[token]