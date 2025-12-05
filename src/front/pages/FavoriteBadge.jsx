import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
// 🛑 CORRECCIÓN: Se eliminó la extensión .jsx para resolver la importación 🛑
import useGlobalReducer from "../hooks/useGlobalReducer"; // Para obtener el token
// Asegúrate de que esta URL de backend esté bien configurada
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

// Componente para el ícono de favoritos con conteo
const FavoriteBadge = ({ theme }) => {
    const { store } = useGlobalReducer();
    const token = store.token;
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    // Señal para forzar la recarga desde otros componentes (ej: RecipeDetail)
    const [refreshSignal, setRefreshSignal] = useState(0); 

    // Clase de texto para el badge (se ajusta al tema, usando Bootstrap)
    const badgeClass = theme === 'dark' 
        ? 'text-white' 
        : 'text-black';

    // Hook para obtener el conteo de favoritos
    useEffect(() => {
        const fetchCount = async () => {
            if (!token) {
                setCount(0);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 🛑 Llamamos al ENDPOINT LIGERO que creamos en el backend
                const url = `${BACKEND_URL}/user/favorites/count`; 
                const res = await fetch(url, { 
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count || 0);
                } else {
                    // Si el token es inválido o hay otro error, mostramos 0
                    console.error("No se pudo obtener el conteo de favoritos", res.status);
                    setCount(0); 
                }

            } catch (err) {
                console.error("Error de red al obtener el conteo:", err);
                setCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
        
        // 🧪 CREAMOS LA FUNCIÓN GLOBAL DE ACTUALIZACIÓN 🧪
        // Esta función será llamada desde RecipeDetail cuando se añada/quite un favorito
        window.refreshFavoritesCount = () => {
            setRefreshSignal(prev => prev + 1); // Incrementa la señal para forzar el useEffect
        };

        // Limpieza: importante al desmontar
        return () => {
             delete window.refreshFavoritesCount;
        };

    // La dependencia 'refreshSignal' hace que este useEffect se ejecute de nuevo
    // cada vez que RecipeDetail llama a window.refreshFavoritesCount().
    }, [token, refreshSignal]); 


    if (loading) {
        // Opcional: mostrar un ícono de carga
        return (
            <div className={`favorites-btn me-2 ${badgeClass}`} aria-label="Cargando favoritos">
                <i className="fa-solid fa-spinner fa-spin-pulse"></i>
            </div>
        );
    }

    return (
        <div className="favorites-badge-container me-2">
            {/* NavLink envuelve el componente para hacerlo clickeable */}
            <NavLink
                to="/favoritos"
                className={`favorites-btn ${badgeClass}`}
                aria-label={`Ver ${count} favoritos`}
            >
                <i className="fa-solid fa-heart"></i>
                
                {/* 🎯 EL BADGE DE CONTEO */}
                {count > 0 && (
                    <span className="badge-count">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </NavLink>

            {/* Este CSS es crucial para posicionar el badge */}
            <style jsx="true">{`
                .favorites-badge-container {
                    position: relative;
                    display: inline-block;
                }
                .favorites-btn {
                    position: relative;
                    display: inline-block;
                    font-size: 1.5rem; /* Ajusta el tamaño del corazón */
                    padding: 0;
                    margin: 0;
                }
                .badge-count {
                    position: absolute;
                    top: -5px;
                    right: -10px;
                    background-color: #ffc107; /* Color de advertencia de Bootstrap */
                    color: black;
                    border-radius: 50%;
                    padding: 0px 5px;
                    font-size: 0.75rem;
                    line-height: 1.2;
                    min-width: 18px;
                    text-align: center;
                    border: 1px solid white; /* Pequeño borde para que destaque */
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};

export default FavoriteBadge;