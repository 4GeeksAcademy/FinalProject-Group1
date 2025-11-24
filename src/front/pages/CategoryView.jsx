import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import "../styles/categoryView.css";

const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || '';
};

export const CategoryView = () => {
    const { categoryId } = useParams();
    const [recipes, setRecipes] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchRecipesByCategory(currentPage);
    }, [categoryId, currentPage]);

    const fetchRecipesByCategory = async (page) => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(
                `${apiUrl}/recipes/category/${categoryId}?page=${page}&per_page=25`
            );
            const data = await response.json();

            if (response.ok) {
                setRecipes(data.recipes);
                setCategoryName(data.category_name);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="category-view-modern">
            {/* Decorative Background Elements */}
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
            <div className="decoration-circle circle-4"></div>
            <div className="decoration-circle circle-5"></div>
            <div className="decoration-circle circle-6"></div>

            {/* Header Section */}
            <div className="category-header-modern">
                <div className="header-navigation">
                    <Link to="/" className="back-link-modern">
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Volver al inicio</span>
                    </Link>
                    
                    <Link to="/categories" className="view-all-categories-link">
                        <span>Ver todas las categorías</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
                
                <div className="category-title-section">
                    <h1 className="category-title-modern">{categoryName}</h1>
                    <div className="decorative-line-category"></div>
                    <p className="category-count-modern">
                        {pagination.total} {pagination.total === 1 ? 'receta encontrada' : 'recetas encontradas'}
                    </p>
                </div>
            </div>

            {/* Recipes Grid */}
            {recipes.length === 0 ? (
                <div className="no-recipes-modern">
                    <div className="empty-state-category">
                        <i className="fa-solid fa-inbox"></i>
                        <h3>No hay recetas en esta categoría</h3>
                        <p>Explora otras categorías para encontrar deliciosas recetas</p>
                        <Link to="/" className="btn-back-home">
                            <i className="fa-solid fa-house"></i>
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="recipes-grid-modern">
                        {recipes.map((recipe) => (
                            <Link
                                to={`/recipe/${recipe.id}`}
                                key={recipe.id}
                                className="recipe-card-grid"
                            >
                                <div className="card-image-grid">
                                    <img src={recipe.image} alt={recipe.title} />
                                    <div className="image-overlay-grid">
                                        <span className="difficulty-tag-grid">{recipe.difficulty}</span>
                                    </div>
                                </div>
                                
                                <div className="card-content-grid">
                                    <h3 className="card-title-grid">{recipe.title}</h3>
                                    
                                    <div className="card-meta-grid">
                                        <div className="meta-badge-grid">
                                            <i className="fa-solid fa-clock"></i>
                                            <span>{recipe.prep_time_min} min</span>
                                        </div>
                                        <div className="meta-badge-grid">
                                            <i className="fa-solid fa-users"></i>
                                            <span>{recipe.portions} porciones</span>
                                        </div>
                                    </div>

                                    {recipe.avg_rating && (
                                        <div className="recipe-rating-grid">
                                            <div className="stars-grid">
                                                {[...Array(5)].map((_, i) => (
                                                    <i 
                                                        key={i}
                                                        className="fa-solid fa-star"
                                                        style={{ color: i < Math.round(recipe.avg_rating) ? '#ffc107' : '#ddd' }}
                                                    ></i>
                                                ))}
                                            </div>
                                            <span className="rating-text-grid">
                                                {recipe.avg_rating.toFixed(1)} ({recipe.vote_count})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination-modern">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.has_prev}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                                <span>Anterior</span>
                            </button>

                            <div className="page-numbers-modern">
                                {[...Array(pagination.pages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.has_next}
                            >
                                <span>Siguiente</span>
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};