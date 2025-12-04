import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Pagination from "../components/Pagination";
import UserCardRecipe from './UserCardRecipe';

const urlBase = import.meta.env.VITE_BACKEND_URL;
const RECIPES_PER_PAGE = 6;

const UserDashboard = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('published');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0);

    const fetchMyRecipes = async (status, page) => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${urlBase}/my-recipes?status=${status}&page=${page}&limit=${RECIPES_PER_PAGE}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al cargar tus recetas");

            const data = await response.json();
            setRecipes(data.recipes);
            setTotalRecipes(data.total_count);
        } catch (error) {
            console.error(error);
            toast.error("No pudimos cargar tus recetas.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMyRecipes(activeTab, currentPage);
    }, [activeTab, currentPage]);

    const handleDelete = async (recipeId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta receta?")) return;

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${urlBase}/recipes/${recipeId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Receta eliminada");
                fetchMyRecipes(activeTab, currentPage);
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    return (
        <div className="container py-5">
            <Toaster position="top-center" richColors />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="display-6 fw-bold text-pink-dark">Mis Recetas</h1>
                <Link to="/recipes/create" className="btn btn-success shadow-sm">
                    <i className="fa-solid fa-plus me-2"></i>Nueva Receta
                </Link>
            </div>

            <ul className="nav nav-pills nav-fill mb-4 bg-white shadow-sm rounded p-2">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'published' ? 'active bg-success' : 'text-muted'}`}
                        onClick={() => handleTabChange('published')}
                    >
                        <i className="fa-solid fa-check-circle me-2"></i>Publicadas
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'pending' ? 'active bg-warning text-dark' : 'text-muted'}`}
                        onClick={() => handleTabChange('pending')}
                    >
                        <i className="fa-solid fa-clock me-2"></i>En Revisión
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'rejected' ? 'active bg-danger' : 'text-muted'}`}
                        onClick={() => handleTabChange('rejected')}
                    >
                        <i className="fa-solid fa-circle-xmark me-2"></i>Rechazadas
                    </button>
                </li>
            </ul>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-pink" role="status"></div>
                    <p className="mt-2">Buscando en tu libro de cocina...</p>
                </div>
            ) : (
                <>
                    {recipes.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded">
                            <i className="fa-solid fa-cookie-bite fa-3x text-muted mb-3"></i>
                            <h3>No tienes recetas en esta sección</h3>
                            <p className="text-muted">¡Es un buen momento para crear algo delicioso!</p>
                            <p className="text-muted">Recuerda rellenar todos los requerimientos de la receta.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {recipes.map((recipe) => (
                                <UserCardRecipe
                                    key={recipe.id}
                                    recipe={{ ...recipe, status: activeTab }}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {totalRecipes > 0 && (
                        <Pagination
                            recipesPerPage={RECIPES_PER_PAGE}
                            totalRecipes={totalRecipes}
                            currentPage={currentPage}
                            paginate={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default UserDashboard;