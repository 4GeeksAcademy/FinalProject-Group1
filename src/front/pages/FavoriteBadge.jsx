import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"; 
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 
import "../styles/favorite_badge.css"

const FavoriteBadge = ({ theme }) => {
    const { store } = useGlobalReducer();
    const token = store.token;
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshSignal, setRefreshSignal] = useState(0); 

    useEffect(() => {
        const fetchCount = async () => {
            if (!token) {
                setCount(0);
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${BACKEND_URL}/user/favorites/count`, { 
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count || 0);
                }
            } catch (err) {
                console.error("Error al obtener el conteo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
        window.refreshFavoritesCount = () => setRefreshSignal(prev => prev + 1); 
        return () => delete window.refreshFavoritesCount;
    }, [token, refreshSignal]); 

    if (loading) return null; 

    return (
        <div className="favorite-icon-wrapper">
            <NavLink to="/favoritos" className="favorite-circle-btn">
                <i className="fa-solid fa-heart main-heart-icon"></i>
                
                {count > 0 && (
                    <span className="badge-count-floating">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </NavLink>
        </div>
    );
};

export default FavoriteBadge;