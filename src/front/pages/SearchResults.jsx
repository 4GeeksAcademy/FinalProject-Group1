import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import "../styles/searchResults.css";

const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || '';
};

export const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query.trim().length >= 2) {
            fetchSearchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchSearchResults = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            
            // Buscar recetas
            const recipesResponse = await fetch(`${apiUrl}/recipes/search?q=${query}`);
            const recipesData = await recipesResponse.json();
            
            // Buscar categorías
            const categoriesResponse = await fetch(`${apiUrl}/categories`);
            const categoriesData = await categoriesResponse.json();
            
            const filteredCategories = categoriesData.filter(cat =>
                cat.name_category.toLowerCase().includes(query.toLowerCase())
            );

            setRecipes(recipesData.recipes || []);
            setCategories(filteredCategories);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setRecipes([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
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

    const totalResults = recipes.length + categories.length;

    return (
        <div className="search-results-modern">
            {/* Decorative Background Elements */}
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
            <div className="decoration-circle circle-4"></div>
            <div className="decoration-circle circle-5"></div>
            <div className="decoration-circle circle-6"></div>

            {/* Header Section */}
            <div className="search-header-modern">
                <Link to="/" className="back-link-modern">
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Volver al inicio</span>
                </Link>

                <div className="search-title-section">
                    <h1 className="search-title-modern">
                        Resultados para: <span className="search-query">"{query}"</span>
                    </h1>
                    <div className="decorative-line-search"></div>
                    <p className="search-count-modern">
                        {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                </div>
            </div>

            {/* No Results */}
            {totalResults === 0 ? (
                <div className="no-results-modern">
                    <div className="empty-state-search">
                        <i className="fa-solid fa-search"></i>
                        <h3>No se encontraron resultados</h3>
                        <p>Intenta con otras palabras clave o términos de búsqueda</p>
                        <Link to="/" className="btn-back-home">
                            <i className="fa-solid fa-house"></i>
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Categories Results */}
                    {categories.length > 0 && (
                        <div className="results-section">
                            <h2 className="section-title-results">
                                <i className="fa-solid fa-folder"></i>
                                Categorías ({categories.length})
                            </h2>
                            <div className="categories-grid-results">
                                {categories.map((category) => (
                                    <Link
                                        to={`/category/${category.id}`}
                                        key={category.id}
                                        className="category-card-result"
                                    >
                                        <div className="category-card-icon-result">
                                            <i className="fa-solid fa-utensils"></i>
                                        </div>
                                        <div className="category-card-content-result">
                                            <h3 className="category-card-title-result">{category.name_category}</h3>
                                            <span className="category-card-link-result">
                                                Ver recetas
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recipes Results */}
                    {recipes.length > 0 && (
                        <div className="results-section">
                            <h2 className="section-title-results">
                                <i className="fa-solid fa-bowl-food"></i>
                                Recetas ({recipes.length})
                            </h2>
                            <div className="recipes-grid-results">
                                {recipes.map((recipe) => (
                                    <Link
                                        to={`/recipe/${recipe.id}`}
                                        key={recipe.id}
                                        className="recipe-card-result"
                                    >
                                        <div className="card-image-result">
                                            <img src={recipe.image} alt={recipe.title} />
                                            <div className="image-overlay-result">
                                                <span className="difficulty-tag-result">{recipe.difficulty}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="card-content-result">
                                            <h3 className="card-title-result">{recipe.title}</h3>
                                            
                                            <div className="card-meta-result">
                                                <div className="meta-badge-result">
                                                    <i className="fa-solid fa-clock"></i>
                                                    <span>{recipe.prep_time_min} min</span>
                                                </div>
                                                <div className="meta-badge-result">
                                                    <i className="fa-solid fa-users"></i>
                                                    <span>{recipe.portions} porciones</span>
                                                </div>
                                            </div>

                                            {recipe.avg_rating && (
                                                <div className="recipe-rating-result">
                                                    <div className="stars-result">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i 
                                                                key={i}
                                                                className="fa-solid fa-star"
                                                                style={{ color: i < Math.round(recipe.avg_rating) ? '#ffc107' : '#ddd' }}
                                                            ></i>
                                                        ))}
                                                    </div>
                                                    <span className="rating-text-result">
                                                        {recipe.avg_rating.toFixed(1)} ({recipe.vote_count})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};