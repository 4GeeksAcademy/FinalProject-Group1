import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyFavorites = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BACKEND_URL}/recetas/favoritos`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Error al cargar favoritos");

                setRecipes(data.recipes || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchFavorites();
    }, [token]);

    if (loading) return <p>Cargando favoritos...</p>;
    if (error) return <p>Error: {error}</p>;

    if (recipes.length === 0) {
        return (
            <div className="recipe-detail-container">
                <h2>Mis Favoritos</h2>
                <p className="text-muted">
                    Todavía no tienes recetas favoritas. Marca alguna receta como favorita para verla aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="recipe-detail-container">
            <h2>Mis Favoritos</h2>
            <div className="recipes-grid">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="recipe-card"
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                        <img src={recipe.image} alt={recipe.title} />
                        <h3>{recipe.title}</h3>
                        <p>{recipe.prep_time_min} min • {recipe.difficulty}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyFavorites;
