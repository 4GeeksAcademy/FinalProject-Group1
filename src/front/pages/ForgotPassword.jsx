import { useState } from "react"
import { Link } from "react-router-dom"
import { Toaster, toast } from "sonner"

const urlBase = import.meta.env.VITE_BACKEND_URL

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleChange = (e) => {
        setEmail(e.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!email) {
            toast.error("Por favor ingresa tu correo electrónico")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${urlBase}/recover-password/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Si tu correo está registrado, recibirás un enlace de recuperación")
                setEmailSent(true)
                setEmail("")
            } else if (response.status === 429) {
                toast.error("Demasiados intentos. Intenta nuevamente más tarde")
            } else if (response.status === 400) {
                toast.error("Correo electrónico inválido")
            } else {
                toast.error("Error al procesar la solicitud. Intenta nuevamente")
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor. Intenta de nuevo más tarde")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container">
            <Toaster position="top-center" richColors />
            <div className="d-flex flex-column">
                <div className="row justify-content-center mt-5">
                    <div className="col-12 col-md-6 mb-3">
                        <h1 className="text-center border border-secondary bg-warning-subtle p-4 rounded">
                            Recuperar Contraseña
                        </h1>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-12 col-md-6">
                        {emailSent ? (
                            <div className="border border-secondary p-5 bg-verde rounded">
                                <div className="text-center">
                                    <i className="fa-solid fa-envelope-circle-check fa-4x text-success mb-4"></i>
                                    <h4 className="mb-3">¡Correo Enviado!</h4>
                                    <p className="text-muted mb-4">
                                        Recibirás un enlace para restablecer tu contraseña.
                                                                            </p>
                                    <p className="text-muted mb-4">
                                        Por favor revisa tu bandeja de entrada o carpeta de spam.
                                    </p>
                                    <div className="d-grid gap-2">
                                        <Link to="/login" className="btn btn-primary">
                                            Volver al inicio de sesión
                                        </Link>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => setEmailSent(false)}
                                        >
                                            Enviar otro correo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form
                                className="border border-secondary p-5 bg-verde rounded"
                                onSubmit={handleSubmit}
                            >
                                <div className="text-center mb-4">
                                    <i className="fa-solid fa-key fa-3x text-primary mb-3"></i>
                                    <p className="text-muted">
                                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                                    </p>
                                </div>

                                <div className="form-group mb-4">
                                    <label htmlFor="txtEmail" className="mb-2">
                                        <b>Correo electrónico:</b>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@email.com"
                                        className="form-control"
                                        id="txtEmail"
                                        name="email"
                                        onChange={handleChange}
                                        value={email}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar enlace de recuperación"
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-sm mb-2">
                                        ¿Recordaste tu contraseña?{" "}
                                        <Link to="/login" className="text-primary fw-bold">
                                            Inicia sesión aquí
                                        </Link>
                                    </p>
                                    <p className="text-sm">
                                        ¿No tienes cuenta?{" "}
                                        <Link to="/register" className="text-primary fw-bold">
                                            Regístrate aquí
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword