import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/categoryView.css";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || '';
};

export const FavoritesView = () => {
    const { store } = useGlobalReducer();
    const token = store.token;

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);
    const [sortBy, setSortBy] = useState('rating'); 
    const difficulties = ['fácil', 'medio', 'difícil'];

    useEffect(() => {
        fetchTopRatedRecipes();
    }, [token]);

    const fetchTopRatedRecipes = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const response = await fetch(`${apiUrl}/recipes/top-rated`, {
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();
                setRecipes(data.recipes || []);
            }
        } catch (error) {
            console.error('Error fetching top rated recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyToggle = (difficulty) => {
        setSelectedDifficulties(prev => {
            if (prev.includes(difficulty)) {
                return prev.filter(d => d !== difficulty);
            } else {
                return [...prev, difficulty];
            }
        });
    };

    // Filtrar y ordenar recetas
    let filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = selectedDifficulties.length === 0 || 
            selectedDifficulties.includes(recipe.difficulty.toLowerCase());
        return matchesSearch && matchesDifficulty;
    });

    // Ordenar según selección
    if (sortBy === 'rating') {
        filteredRecipes = [...filteredRecipes].sort((a, b) => {
            const ratingA = a.avg_rating || 0;
            const ratingB = b.avg_rating || 0;
            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }
            return (b.vote_count || 0) - (a.vote_count || 0);
        });
    }

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
                    <h1 className="category-title-modern">
                        <i className="fa-solid fa-star" style={{ color: '#ffd700', marginRight: '15px' }}></i>
                        Mejor Valoradas
                    </h1>
                    <div className="decorative-line-category"></div>
                    <p className="category-count-modern">
                        {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta encontrada' : 'recetas encontradas'}
                    </p>
                </div>

                {recipes.length > 0 && (
                    <>
                        {/* Search Bar */}
                        <div className="category-search-container">
                            <div className="category-search-wrapper">
                                <i className="fa-solid fa-search category-search-icon"></i>
                                <input
                                    type="text"
                                    className="category-search-input"
                                    placeholder="Buscar en recetas mejor valoradas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="category-clear-btn" onClick={() => setSearchTerm('')}>
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="difficulty-filter">
                            <div className="filter-label">
                                <i className="fa-solid fa-filter filter-icon"></i>
                                <span>Filtrar por dificultad:</span>
                            </div>
                            <div className="checkbox-group">
                                {difficulties.map((difficulty) => (
                                    <label 
                                        key={difficulty} 
                                        className={`checkbox-label ${selectedDifficulties.includes(difficulty) ? 'active' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={selectedDifficulties.includes(difficulty)}
                                            onChange={() => handleDifficultyToggle(difficulty)}
                                        />
                                        <span className="checkbox-custom">
                                            {selectedDifficulties.includes(difficulty) && (
                                                <i className="fa-solid fa-check check-icon"></i>
                                            )}
                                        </span>
                                        <span className="difficulty-text">
                                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {selectedDifficulties.length > 0 && (
                                <button 
                                    className="clear-filters-btn"
                                    onClick={() => setSelectedDifficulties([])}
                                >
                                    <i className="fa-solid fa-times-circle"></i>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Recipes Grid */}
            {recipes.length === 0 ? (
                <div className="no-recipes-modern">
                    <div className="empty-state-category">
                        <i className="fa-solid fa-star-half-stroke" style={{ fontSize: '4rem', color: '#ffd700' }}></i>
                        <h3>Aún no hay recetas valoradas</h3>
                        <p>Sé el primero en votar por tus recetas favoritas</p>
                        <Link to="/" className="btn-back-home">
                            <i className="fa-solid fa-house"></i>
                            Explorar Recetas
                        </Link>
                    </div>
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="no-recipes-modern">
                    <div className="empty-state-category">
                        <i className="fa-solid fa-inbox"></i>
                        <h3>No se encontraron recetas con esos criterios</h3>
                        <p>Intenta con otros términos de búsqueda o filtros</p>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedDifficulties([]);
                            }}
                            className="btn-back-home"
                        >
                            <i className="fa-solid fa-rotate-left"></i>
                            Limpiar búsqueda y filtros
                        </button>
                    </div>
                </div>
            ) : (
                <div className="recipes-grid-modern">
                    {filteredRecipes.map((recipe) => (
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
                                
                                {/* Solo mostrar badge de estrella en mejor valoradas */}
                                <div className="favorite-badge star-badge single-badge">
                                    <i className="fa-solid fa-star"></i>
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

                                <div className="recipe-rating-grid">
                                    <div className="stars-grid">
                                        {[...Array(5)].map((_, i) => (
                                            <i 
                                                key={i}
                                                className="fa-solid fa-star"
                                                style={{ color: i < Math.round(recipe.avg_rating || 0) ? '#ffc107' : '#ddd' }}
                                            ></i>
                                        ))}
                                    </div>
                                    <span className="rating-text-grid">
                                        {(recipe.avg_rating || 0).toFixed(1)} ({recipe.vote_count || 0} votos)
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};