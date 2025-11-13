import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_recovery_email(email, token):
    # Construir enlace de recuperación
    frontend_url = os.getenv('FRONTEND_URL')
    recovery_link = f"{frontend_url}/reset-password?token={token}"
    
    print(f"Preparando email para: {email}")
    print(f"Link de recuperación: {recovery_link}")
    
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
        print(f"API Key existe: {api_key is not None}")
        print(f"From email: {os.getenv('SENDGRID_FROM_EMAIL')}")
        
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        print(f"SendGrid response status: {response.status_code}")
        print(f"Email enviado exitosamente")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        print(f"Tipo de error: {type(e).__name__}")
        return False