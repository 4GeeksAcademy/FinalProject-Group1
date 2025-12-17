import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/categoriesListView.css";

const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || '';
};

export const CategoriesListView = () => {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 25;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/categories`);
            const data = await response.json();

            if (response.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredCategories = categories.filter(category =>
        category.name_category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

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
                    
                    <Link to="/favorites" className="view-all-categories-link">
                        <span>Ver mejor valoradas</span>
                        <i className="fa-solid fa-star"></i>
                    </Link>
                </div>

                <div className="category-title-section">
                    <h1 className="category-title-modern">Todas las Categorías</h1>
                    <div className="decorative-line-category"></div>
                    <p className="category-count-modern">
                        {filteredCategories.length} {filteredCategories.length === 1 ? 'categoría disponible' : 'categorías disponibles'}
                    </p>
                </div>

                <div className="search-dropdown-container">
                    <div className="search-input-wrapper">
                        <i className="fa-solid fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {filteredCategories.length === 0 ? (
                <div className="no-recipes-modern">
                    <div className="empty-state-category">
                        <i className="fa-solid fa-inbox"></i>
                        <h3>
                            {searchTerm 
                                ? 'No se encontraron categorías con ese criterio' 
                                : 'No hay categorías disponibles'}
                        </h3>
                        <p>
                            {searchTerm 
                                ? 'Intenta con otro término de búsqueda' 
                                : 'Aún no se han creado categorías'}
                        </p>
                        {searchTerm ? (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="btn-back-home"
                            >
                                <i className="fa-solid fa-rotate-left"></i>
                                Limpiar búsqueda
                            </button>
                        ) : (
                            <Link to="/" className="btn-back-home">
                                <i className="fa-solid fa-house"></i>
                                Volver al inicio
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="categories-grid">
                        {currentCategories.map((category) => (
                            <Link
                                to={`/category/${category.id}`}
                                key={category.id}
                                className="category-card"
                            >
                                <div className="category-card-icon">
                                    <i className="fa-solid fa-utensils"></i>
                                </div>
                                <div className="category-card-content">
                                    <h3 className="category-card-title">{category.name_category}</h3>
                                    <span className="category-card-link">
                                        Ver recetas
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {!searchTerm && totalPages > 1 && (
                        <div className="pagination-modern">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                                <span>Anterior</span>
                            </button>

                            <div className="page-numbers-modern">
                                {[...Array(totalPages)].map((_, index) => (
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
                                disabled={currentPage === totalPages}
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