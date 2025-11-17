import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer'; 

export const Login = () => {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); 
    
    const { actions } = useGlobalReducer(); 
    const navigate = useNavigate();

    const API_URL = 'http://localhost:3001/api/login';

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
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) { 
                const { token, user_info } = data;

                localStorage.setItem('access_token', token); 

                actions.setAuthData(token, user_info); 

                console.log(data.msg);
                navigate('/admin-panel'); 

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

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            Inicio de Sesión
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                
                                {/* Campo de Usuario */}
                                <div className="mb-3">
                                    <label htmlFor="username">Usuario</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                {/* Campo de Contraseña */}
                                <div className="mb-3">
                                    <label htmlFor="password">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Cargando...' : 'Ingresar'}
                                </button>
                            </form>
                            
                            {/* Enlaces requeridos */}
                            <div className="mt-3 text-center">
                                <Link to="/register" className="me-3">Registrarme</Link>
                                <Link to="/forgot-password">Olvidé mi contraseña</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};