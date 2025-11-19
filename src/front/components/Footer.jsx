import { useState, useEffect } from "react"

export const Footer = () => {
	const [socialMedia, setSocialMedia] = useState([])
	const currentYear = new Date().getFullYear()

	useEffect(() => {
		setSocialMedia([
			{ id: 1, platform: 'Facebook', url: 'https://www.facebook.com/tuusuario', active: true },
			{ id: 2, platform: 'Instagram', url: 'https://www.instagram.com/tuusuario', active: true },
			{ id: 3, platform: 'WhatsApp', url: 'https://wa.me/1234567890', active: true },
			{ id: 4, platform: 'LinkedIn', url: 'https://www.linkedin.com/in/tuusuario', active: true },
			{ id: 5, platform: 'GitHub', url: 'https://github.com/tuusuario', active: true }
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
		<footer className="bg-body-tertiary border-top py-1 mt-5">
			<div className="container">
				<div className="row align-items-center">

					<div className="col-12 col-md-6 text-center text-md-start mb-2 mb-md-0 text-secondary">
						<p className="mb-0 fw-bold" style={{ fontSize: '0.75rem' }}>
							&copy; {currentYear} Saborify ❤️ Todos los derechos reservados.
						</p>
					</div>

					<div className="col-12 col-md-6 mb-2 mb-md-0 text-center text-md-end">
						<p className="mb-1 "><b>Síguenos en nuestras redes sociales</b></p>

						<div className="d-flex justify-content-center justify-content-md-end gap-2 flex-wrap">
							{socialMedia.map((social) => (
								<a
									key={social.id}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
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
