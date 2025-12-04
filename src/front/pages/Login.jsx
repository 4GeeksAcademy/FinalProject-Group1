import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import "../styles/login.css";

export const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);


        if (!username || !password) {
            setError("Usuario y contraseña son requeridos.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                const { token, user_info } = data;
                console.log("Login exitoso, token recibido:", user_info);
                localStorage.setItem('access_token', token);
                localStorage.setItem('user', JSON.stringify(user_info));
                dispatch({ type: "SET_USER", payload: user_info })
                dispatch({ type: "SET_TOKEN", payload: data.token })

                navigate('/');


            } else {
                const errorMessage = data.message || 'Error desconocido al iniciar sesión.';
                setError(errorMessage);

            }
        } catch (err) {
            console.error("Error de red/servidor:", err);
            setError('No se pudo conectar con el servidor. Por favor, revisa la conexión.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevShowPassword => !prevShowPassword);
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5">
                        <div className="card login-card">
                            <div className="login-card-header">
                                <h1 className="login-title">Bienvenido de nuevo</h1>
                                <p className="login-subtitle">
                                    Inicia sesión para acceder a tus recetas y favoritos.
                                </p>
                            </div>

                            <div className="card-body login-card-body">
                                <form onSubmit={handleSubmit} className="login-form">
                                    {error && (
                                        <div className="alert alert-danger login-alert">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="username" className="login-label">
                                            Usuario
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control login-input"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="login-label">
                                            Contraseña
                                        </label>
                                        <div className="input-group login-input-group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control login-input"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn toggle-password-btn"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? (
                                                    <i className="fa-solid fa-eye-slash" />
                                                ) : (
                                                    <i className="fa-solid fa-eye" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn login-submit-btn w-100"
                                        disabled={loading}
                                    >
                                        {loading ? "Cargando..." : "Ingresar"}
                                    </button>
                                </form>

                                <div className="login-links mt-3 text-center">
                                    <Link to="/register" className="login-link">
                                        Registrarme
                                    </Link>
                                    <span className="login-links-separator">·</span>
                                    <Link to="/forgot-password" className="login-link">
                                        Olvidé mi contraseña
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};