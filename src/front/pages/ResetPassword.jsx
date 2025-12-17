import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const passwordRequirements = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
    { key: 'lowerCase', label: 'Al menos una letra minúscula', regex: /[a-z]/ },
    { key: 'upperCase', label: 'Al menos una letra mayúscula', regex: /[A-Z]/ },
    { key: 'number', label: 'Al menos un número', regex: /[0-9]/ },
    { key: 'specialChar', label: 'Al menos un caracter especial (!@#$%^&*()_-+=;:,<.>)', regex: /[!@#$%^&*()\-_=+{};:,<.>]/ },
];

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const [passwordValidity, setPasswordValidity] = useState({
        minLength: false,
        lowerCase: false,
        upperCase: false,
        number: false,
        specialChar: false,
    });

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");

        if (!tokenFromUrl) {
            setError("Token no encontrado en la URL");
            setIsLoading(false);
            return;
        }

        setToken(tokenFromUrl);
        validateToken(tokenFromUrl);
    }, [searchParams]);

    const validateToken = async (tokenToValidate) => {
        try {
            const response = await fetch(
                `${backendUrl}/recover-password/validate/${tokenToValidate}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.valid) {
                setIsValidToken(true);
            } else {
                setError(data.message || "Token inválido o expirado");
            }
        } catch (err) {
            setError("Error al validar el token");
        } finally {
            setIsLoading(false);
        }
    };

    const validatePasswordRequirements = (password) => {
        const newValidity = {};
        let isAllValid = true;

        passwordRequirements.forEach(req => {
            const isValid = req.regex.test(password);
            newValidity[req.key] = isValid;
            if (!isValid) {
                isAllValid = false;
            }
        });

        setPasswordValidity(newValidity);
        return isAllValid;
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePasswordRequirements(newPassword);
    };

    const checkPasswordValid = () => {
        let isAllValid = true;
        passwordRequirements.forEach(req => {
            if (!passwordValidity[req.key]) {
                isAllValid = false;
            }
        });
        return isAllValid;
    };

    const isPasswordValid = checkPasswordValid();
    const shouldShowRequirements = isPasswordFocused || password.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmation) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!isPasswordValid) {
            setError("La contraseña no cumple todos los requisitos de seguridad");
            return;
        }

        try {
            const response = await fetch(
                `${backendUrl}/recover-password/reset`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: token,
                        password: password,
                        confirmation: confirmation,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("¡Contraseña actualizada exitosamente!");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setError(data.error || "Error al actualizar la contraseña");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }
    };

    if (isLoading) {
        return (
            <div className="container">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="text-muted">Validando enlace...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="container">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="bg-warning-subtle border border-danger p-5 rounded text-center">
                            <i className="fa-solid fa-triangle-exclamation fa-4x text-danger mb-4"></i>
                            <h3 className="mb-3">Enlace Inválido o Expirado</h3>
                            <p className="text-muted mb-4">{error}</p>
                            <p className="text-muted mb-4">
                                Los enlaces de recuperación expiran después de 1 hora por seguridad.
                            </p>
                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Solicitar nuevo enlace
                                </button>
                                <Link to="/" className="btn btn-outline-secondary">
                                    Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row justify-content-center ">
                <div className="col-12 col-md-6 mb-3">
                    <h1 className="text-center bg-warning-subtle p-4 mt-5 rounded border border-secondary ">
                        Restablecer Contraseña
                    </h1>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-md-6">
                    <div className="border border-secondary p-5 bg-verde rounded">
                        <div className="text-center mb-4">
                            <i className="fa-solid fa-lock fa-3x text-primary mb-3"></i>
                            <p className="text-muted">
                                Ingresa tu nueva contraseña. Asegúrate de que sea segura.
                            </p>
                        </div>

                        {message && (
                            <div className="alert alert-success" role="alert">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="username"
                                autoComplete="username"
                                style={{ display: 'none' }}
                                tabIndex="-1"
                                aria-hidden="true"
                            />
                            <div className="mb-4">
                                <label htmlFor="password" className="form-label">
                                    <b>Nueva Contraseña:</b>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${password.length > 0 && (isPasswordValid ? 'is-valid' : 'is-invalid')}`}
                                        id="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        required
                                        placeholder="******************"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>

                                {shouldShowRequirements && (
                                    <div className="mt-3 p-3 bg-light rounded border">
                                        <h6 className="fw-bold mb-2 text-primary">Requisitos de seguridad:</h6>
                                        <ul className="list-unstyled mb-0">
                                            {passwordRequirements.map(req => {
                                                const isCompleted = passwordValidity[req.key];
                                                return (
                                                    <li key={req.key} className={`mb-1 ${isCompleted ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-circle-xmark'} me-2`}></i>
                                                        <span className={isCompleted ? 'text-decoration-line-through opacity-75' : ''}>
                                                            {req.label}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="confirmation" className="form-label">
                                    <b>Confirmar Contraseña:</b>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmation ? "text" : "password"}
                                        className={`form-control ${confirmation.length > 0 && password.length > 0 && (password === confirmation ? 'is-valid' : 'is-invalid')}`}
                                        id="confirmation"
                                        value={confirmation}
                                        onChange={(e) => setConfirmation(e.target.value)}
                                        required
                                        placeholder="******************"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowConfirmation(!showConfirmation)}
                                    >
                                        <i className={`fa-solid ${showConfirmation ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {confirmation && password && password !== confirmation && (
                                    <small className="text-danger d-block mt-2">¡Las contraseñas no coinciden!</small>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                            >
                                Restablecer Contraseña
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <Link to="/" className="text-primary fw-bold">
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;