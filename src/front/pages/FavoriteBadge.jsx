import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"; 
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

const FavoriteBadge = ({ theme }) => {
    const { store } = useGlobalReducer();
    const token = store.token;
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshSignal, setRefreshSignal] = useState(0); 

    const badgeClass = theme === 'dark' 
        ? 'text-white' 
        : 'text-black';

    useEffect(() => {
        const fetchCount = async () => {
            if (!token) {
                setCount(0);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const url = `${BACKEND_URL}/user/favorites/count`; 
                const res = await fetch(url, { 
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count || 0);
                } else {
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
        window.refreshFavoritesCount = () => {
            setRefreshSignal(prev => prev + 1); 
        };

        return () => {
             delete window.refreshFavoritesCount;
        };

    }, [token, refreshSignal]); 


    if (loading) {
        return (
            <div className={`favorites-btn me-2 ${badgeClass}`} aria-label="Cargando favoritos">
                <i className="fa-solid fa-spinner fa-spin-pulse"></i>
            </div>
        );
    }

    return (
        <div className="favorites-badge-container me-2">
            <NavLink
                to="/favoritos"
                className={`favorites-btn ${badgeClass}`}
                aria-label={`Ver ${count} favoritos`}
            >
                <i className="fa-solid fa-heart"></i>
                
                {count > 0 && (
                    <span className="badge-count">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </NavLink>

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