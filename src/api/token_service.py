from datetime import datetime, timedelta
import secrets
import logging


logger = logging.getLogger(__name__)

active_tokens = {}

def generate_token(user_id):
    token = secrets.token_urlsafe(32)
    expiration = datetime.now() + timedelta(hours=1)
    
    active_tokens[token] = {
        'user_id': user_id,
        'expiration': expiration
    }
    
    logger.debug(f"Token generated for user_id: {user_id}, Expires in 1 hour")
    
    return token

def validate_token(token):
    if token not in active_tokens:
        logger.debug("Token not found in active tokens")
        return None
    
    token_data = active_tokens[token]
    
    if datetime.now() > token_data['expiration']:
        logger.debug(f"Token expired for user_id: {token_data['user_id']}")
        del active_tokens[token]
        return None
    
    logger.debug(f"Token valid for user_id: {token_data['user_id']}")
    return token_data['user_id']

def delete_token(token):
    if token in active_tokens:
        user_id = active_tokens[token]['user_id']
        del active_tokens[token]
        logger.debug(f"Token removed for user_id: {user_id}")