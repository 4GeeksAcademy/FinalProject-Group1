import React, { useEffect, useState } from "react";
import { RecipeCardMini } from "../components/RecipeCardMini";
import "../styles/myfavorites.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token =
                    localStorage.getItem("access_token") ||
                    localStorage.getItem("token") ||
                    null;

                if (!token) {
                    setError("Debes iniciar sesión para ver tus favoritos.");
                    setLoading(false);
                    return;
                }

                    const res = await fetch(`${BACKEND_URL}/favoritos`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) {
                        let data = {};
                        try {
                            data = await res.json();
                        } catch (_) { }
                        throw new Error(data.message || "Error al cargar favoritos");
                    }

                    const data = await res.json();
                    setFavorites(data.favorites || []);
                } catch (err) {
                    console.error(err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchFavorites();
        }, []);

    if (loading) {
        return <p>Cargando favoritos...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (favorites.length === 0) {
        return <p>No tienes recetas en favoritos todavía.</p>;
    }

    return (
        <div className="my-favorites-container">
            <h1>Mis favoritos</h1>
            <div className="favorites-grid">
                {favorites.map((recipe) => (
                    <RecipeCardMini key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
};

export default MyFavorites;
