import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Configurar logger para este módulo
logger = logging.getLogger(__name__)

def send_recovery_email(email, token):
    # Construir enlace de recuperación
    frontend_url = os.getenv('FRONTEND_URL')
    recovery_link = f"{frontend_url}/reset-password?token={token}"
    
    logger.debug(f"Preparando email de recuperación para: {email}")
    
    message = Mail(
        from_email=os.getenv('SENDGRID_FROM_EMAIL'),
        to_emails=email,
        subject='Password Recovery',
        html_content=f'''
            <h2>Recuperación de contraseña</h2>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href="{recovery_link}">Restablecer contraseña</a>
            <p>Este enlace caduca en 1 hora.</p>
        '''
    )
    
    try:
        api_key = os.getenv('SENDGRID_API_KEY')
        
        if not api_key:
            logger.error("SENDGRID_API_KEY no configurado en variables de entorno")
            return False
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        if response.status_code == 202:
            logger.info(f"Email enviado exitosamente a {email} (Status: {response.status_code})")
            return True
        else:
            logger.warning(f"Email enviado con status inesperado: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error al enviar email a {email}: {type(e).__name__} - {str(e)}")
        return False