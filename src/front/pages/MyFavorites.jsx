import React, { useEffect, useState } from "react";
import { RecipeCardMini } from "../components/RecipeCardMini";
import "../styles/myfavorites.css";
import { Link } from "react-router-dom";

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
        return (
            <div className="container text-center my-5 py-5 shadow-sm rounded bg-light border">
                <div className="empty-favorites-content">
                    <i className="fa-regular fa-heart fa-5x text-muted mb-4"></i>

                    <h2 className="fw-bold text-dark">¡Tu lista de favoritos está esperando!</h2>

                    <p className="text-muted mb-4 px-3">
                        Parece que aún no has guardado ninguna receta. <br />
                        Explora nuestro recetario y guarda las que más te gusten para tenerlas siempre a mano.
                    </p>

                    <Link to="/" className="btn btn-lg btn-success rounded-pill px-5 shadow-sm">
                        <i className="fa-solid fa-utensils me-2"></i>
                        Explorar Recetas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="row mb-4">
                <div className="col-12 text-center shadow p-3 title-rl bg-white mb-5">
                    <h1><i className="fa-solid fa-heart text-danger me-2"></i>Mis Favoritos</h1>
                </div>
            </div>

            <div className="row d-flex justify-content-start">
                {favorites.map((recipe) => (
                    <div key={recipe.id} className="col-12 col-sm-10 col-md-6 col-lg-4 mb-5 px-4">
                        <RecipeCardMini recipe={recipe} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyFavorites;
