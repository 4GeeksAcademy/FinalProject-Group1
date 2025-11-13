from datetime import datetime, timedelta
import secrets
import logging

# Configurar logger para este módulo
logger = logging.getLogger(__name__)

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
    
    logger.debug(f"Token generado para user_id: {user_id}, expira en 1 hora")
    
    return token

def validate_token(token):
    # Retorna user_id si es válido, None si no
    if token not in active_tokens:
        logger.debug("Token no encontrado en tokens activos")
        return None
    
    token_data = active_tokens[token]
    
    if datetime.now() > token_data['expiration']:
        logger.debug(f"Token expirado para user_id: {token_data['user_id']}")
        del active_tokens[token]
        return None
    
    logger.debug(f"Token válido para user_id: {token_data['user_id']}")
    return token_data['user_id']

def delete_token(token):
    # Eliminar token después de usarlo
    if token in active_tokens:
        user_id = active_tokens[token]['user_id']
        del active_tokens[token]
        logger.debug(f"Token eliminado para user_id: {user_id}")