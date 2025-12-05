import { useState, useEffect } from "react"
import '../styles/footer.css' // Importamos los estilos del footer

export const Footer = () => {
    const [socialMedia, setSocialMedia] = useState([])
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        setSocialMedia([
            { id: 1, platform: 'Facebook', url: 'https://www.facebook.com', active: true },
            { id: 2, platform: 'Instagram', url: 'https://www.instagram.com', active: true },
            { id: 3, platform: 'WhatsApp', url: 'https://wa.me/1234567890', active: true },
            { id: 4, platform: 'LinkedIn', url: 'https://www.linkedin.com/feed/', active: true },
            { id: 5, platform: 'GitHub', url: 'https://github.com', active: true }
        ])
    }, [])

    const getIconClass = (platform) => {
        const icons = {
            facebook: 'fab fa-facebook-f',
            instagram: 'fab fa-instagram',
            whatsapp: 'fab fa-whatsapp',
            linkedin: 'fab fa-linkedin-in',
            github: 'fab fa-github'
        }
        return icons[platform.toLowerCase()] || 'fas fa-link'
    }

    return (
        // Reemplazamos clases fijas (bg-body-tertiary, border-top) por la clase .footer-container 
        // que maneja los colores dinámicos desde footer.css
        <footer className="footer-container py-1">
            <div className="container">
                <div className="row align-items-center">

                    <div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0">
                        <p className="footer-text mb-0 fw-bold">
                            &copy; {currentYear} Saborify ❤️ Todos los derechos reservados.
                        </p>
                    </div>

                    <div className="col-12 col-md-6 mb-2 mb-md-0 text-center text-md-end">
                        <p className="mb-1 fw-bold footer-text">Síguenos en nuestras redes sociales</p>

                        <div className="d-flex justify-content-center justify-content-md-end gap-2 flex-wrap footer-social-links">
                            {socialMedia.map((social) => (
                                <a
                                    key={social.id}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    // Clase dinámica para los botones sociales
                                    className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center p-0 "
                                    style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}
                                    aria-label={`Visitar ${social.platform}`}
                                    title={social.platform}
                                >
                                    <i className={getIconClass(social.platform)}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )
}

export default Footer;