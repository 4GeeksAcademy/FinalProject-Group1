from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from base64 import b64encode
import os
import logging
from werkzeug.security import generate_password_hash
from api.models import db, User
from api.utils import val_email, val_password
from api.email_service import send_recovery_email
from api.token_service import generate_token, validate_token, delete_token

# Configurar logger para este módulo
logger = logging.getLogger(__name__)

bp = Blueprint('password_recovery', __name__, url_prefix='/api/recover-password')

# Rate limiting
requests_per_email = {}

def check_rate_limit(email):
    now = datetime.now()
    
    if email in requests_per_email:
        requests = [r for r in requests_per_email[email] if (now - r).total_seconds() < 3600]
        requests_per_email[email] = requests
        
        if len(requests) >= 3:
            return False
    else:
        requests_per_email[email] = []
    
    requests_per_email[email].append(now)
    return True

@bp.route('/request', methods=['POST'])
def request_recovery():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    logger.debug(f"Solicitud de recuperación recibida para: {email}")
    
    if not val_email(email):
        logger.warning(f"Email inválido recibido: {email}")
        return jsonify({'error': 'Invalid email'}), 400
    
    if not check_rate_limit(email):
        logger.warning(f"Rate limit excedido para email: {email}")
        return jsonify({'error': 'Too many requests. Try again later'}), 429
    
    user = User.query.filter_by(email=email).first()
    
    # Siempre retornar el mismo mensaje por seguridad
    message = "If your email is registered, you will receive a link shortly"
    
    if user:
        logger.info(f"Token de recuperación generado para user_id: {user.id_user}")
        token = generate_token(user.id_user)
        
        email_sent = send_recovery_email(email, token)
        if email_sent:
            logger.info(f"Email de recuperación enviado exitosamente a: {email}")
        else:
            logger.error(f"Fallo al enviar email de recuperación a: {email}")
    else:
        logger.debug(f"Intento de recuperación para email no registrado: {email}")
    
    return jsonify({'message': message}), 200

@bp.route('/validate/<token>', methods=['GET'])
def validate_recovery_token(token):
    user_id = validate_token(token)
    
    if user_id is None:
        logger.warning(f"Token inválido o expirado recibido")
        return jsonify({'valid': False, 'message': 'Invalid or expired token'}), 400
    
    logger.debug(f"Token validado exitosamente para user_id: {user_id}")
    return jsonify({'valid': True, 'message': 'Valid token'}), 200

@bp.route('/reset', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    confirmation = data.get('confirmation')
    
    if not token or not new_password or not confirmation:
        logger.warning("Solicitud de reset con campos faltantes")
        return jsonify({'error': 'Missing required fields'}), 400
    
    if new_password != confirmation:
        logger.warning("Contraseñas no coinciden en solicitud de reset")
        return jsonify({'error': 'Passwords do not match'}), 400
    
    user_id = validate_token(token)
    if user_id is None:
        logger.warning("Intento de reset con token inválido o expirado")
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    if not val_password(new_password):
        logger.warning(f"Contraseña no cumple requisitos para user_id: {user_id}")
        return jsonify({'error': 'Password is invalid. Requires 8+ chars, upper/lower case, number, special char, and no 3 consecutive numbers.'}), 400
    
    user = User.query.get(user_id)
    if not user:
        logger.error(f"Usuario no encontrado para user_id: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    # Actualizar contraseña
    salt = b64encode(os.urandom(16)).decode("utf-8")
    user.password = generate_password_hash(f"{new_password}{salt}")
    user.salt = salt
    user.updated_at = datetime.now(timezone.utc)
    
    try:
        db.session.commit()
        delete_token(token)
        logger.info(f"Contraseña actualizada exitosamente para user_id: {user_id}")
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error al actualizar contraseña para user_id: {user_id} - {str(e)}")
        return jsonify({'error': 'Error updating password'}), 500