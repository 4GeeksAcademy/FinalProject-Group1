import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/home.css";
import BannerRecetas from "../assets/img/BannerRecetas.png";
import Comment from './Comment';


const getApiUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || '';
};

export const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el dropdown
  const [searchResults, setSearchResults] = useState({ recipes: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchRecipesSummary();

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      if (window.scrollY < 50) {
        setSelectedCategory('all');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
      setSearchTerm(''); 
      setSearchResults({ recipes: [], categories: [] }); 
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


  // Buscar mientras escribe
  useEffect(() => {
    if (searchTerm.length >= 2) {
      setLoadingSearch(true);
      const timer = setTimeout(async () => {
        try {
          const apiUrl = getApiUrl();

          // Buscar recetas
          const recipesResponse = await fetch(`${apiUrl}/recipes/search?q=${searchTerm}`);
          const recipesData = await recipesResponse.json();

          // Buscar categorías
          const categoriesResponse = await fetch(`${apiUrl}/categories`);
          const categoriesData = await categoriesResponse.json();

          const filteredCategories = categoriesData
            .filter(cat => cat.name_category.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 3);

          const filteredRecipes = (recipesData.recipes || []).slice(0, 5);

          setSearchResults({
            recipes: filteredRecipes,
            categories: filteredCategories
          });
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setLoadingSearch(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults({ recipes: [], categories: [] });
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();

      if (response.ok) {
        setAllCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecipesSummary = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/recipes/resumen`);
      const data = await response.json();

      if (response.ok) {
        const reversedCategories = {};
        const keys = Object.keys(data.categories).reverse();
        keys.forEach(key => {
          reversedCategories[key] = data.categories[key];
        });
        setCategories(reversedCategories);
      } else {
        setError(data.message || 'Error al cargar las recetas');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim().length >= 2) {
      setShowDropdown(false);
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleResultClick = (type, id) => {
    setShowDropdown(false);
    setSearchTerm('');
    if (type === 'recipe') {
      navigate(`/recipe/${id}`);
    } else {
      navigate(`/category/${id}`);
    }
    window.scrollTo(0, 0);
  };

  const scrollCarousel = (categoryId, direction) => {
    const container = document.getElementById(`carousel-${categoryId}`);
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);

    if (categoryId !== 'all') {
      setTimeout(() => {
        const sectionElement = document.getElementById(`category-section-${categoryId}`);
        if (sectionElement) {
          const navbar = document.querySelector('nav.navbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 48;
          const elementPosition = sectionElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const categoriesWithRecipes = allCategories.filter((category) => {
    const categoryData = Object.values(categories).find(
      cat => cat.category_id === category.id
    );
    return categoryData && categoryData.recipes && categoryData.recipes.length > 0;
  });

  const totalResults = searchResults.recipes.length + searchResults.categories.length;

  return (
    <div className="home-modern-container">
      {/* Decorative Background Elements */}
      <div className="decoration-circle circle-0"></div>
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>
      <div className="decoration-circle circle-4"></div>
      <div className="decoration-circle circle-5"></div>
      <div className="decoration-circle circle-6"></div>
      <div className="decoration-circle circle-7"></div>
      <div className="decoration-circle circle-8"></div>
      <div className="decoration-circle circle-9"></div>
      <div className="decoration-circle circle-10"></div>
      <div className="decoration-circle circle-11"></div>

      {/* Hero Section */}
      <section className="hero-modern-full">
        <div className="hero-modern">
          <div className="hero-content-modern">
            <h1 className="hero-title-modern">
              Explora <span className="text-highlight-modern">Sabores</span> Únicos
            </h1>
            <p className="hero-subtitle-modern">
              Descubre recetas deliciosas para cada momento del día
            </p>

            {/* Buscador con Dropdown */}
            <div className="hero-search-container" ref={dropdownRef}>
              <div className="hero-search-wrapper">
                <i className="fa-solid fa-search hero-search-icon"></i>
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Buscar recetas o categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                {searchTerm && (
                  <button type="button" className="hero-clear-btn" onClick={clearSearch}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
                <button type="button" className="hero-search-btn" onClick={handleSearch}>
                  <i className="fa-solid fa-search"></i>
                </button>
              </div>
              {/* Dropdown de resultados */}
              {showDropdown && (
                <div className="search-dropdown">
                  {loadingSearch ? (
                    <div className="dropdown-loading">
                      <div className="spinner-border spinner-border-sm text-warning" role="status">
                        <span className="visually-hidden">Buscando...</span>
                      </div>
                      <span>Buscando...</span>
                    </div>
                  ) : totalResults === 0 ? (
                    <div className="dropdown-empty">
                      <i className="fa-solid fa-search"></i>
                      <p>No se encontraron resultados</p>
                    </div>
                  ) : (
                    <div className="dropdown-results">
                      {/* Categorías */}
                      {searchResults.categories.length > 0 && (
                        <div className="dropdown-section">
                          <div className="dropdown-section-title">
                            <i className="fa-solid fa-folder"></i>
                            <span>Categorías</span>
                          </div>
                          {searchResults.categories.map((category) => (
                            <div
                              key={`cat-${category.id}`}
                              className="dropdown-item"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleResultClick('category', category.id);
                              }}
                            >
                              <div className="dropdown-item-icon">
                                <i className="fa-solid fa-utensils"></i>
                              </div>
                              <div className="dropdown-item-content">
                                <span className="dropdown-item-title">{category.name_category}</span>
                                <span className="dropdown-item-subtitle">Categoría</span>
                              </div>
                              <i className="fa-solid fa-chevron-right dropdown-item-arrow"></i>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recetas */}
                      {searchResults.recipes.length > 0 && (
                        <div className="dropdown-section">
                          <div className="dropdown-section-title">
                            <i className="fa-solid fa-bowl-food"></i>
                            <span>Recetas</span>
                          </div>
                          {searchResults.recipes.map((recipe) => (
                            <div
                              key={`recipe-${recipe.id}`}
                              className="dropdown-item"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleResultClick('recipe', recipe.id);
                              }}
                            >
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="dropdown-item-image"
                              />
                              <div className="dropdown-item-content">
                                <span className="dropdown-item-title">{recipe.title}</span>
                                <span className="dropdown-item-subtitle">
                                  {recipe.prep_time_min} min • {recipe.difficulty}
                                </span>
                              </div>
                              <i className="fa-solid fa-chevron-right dropdown-item-arrow"></i>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ver todos los resultados */}
                      <div
                        className="dropdown-view-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSearch();
                        }}
                      >
                        Ver todos los resultados ({totalResults})
                        <i className="fa-solid fa-arrow-right"></i>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
          <div className="hero-image-modern">
            <div className="image-decoration"></div>
            <img
              src={BannerRecetas}
              alt="Delicious food"
            />
          </div>
        </div>
      </section>

      {/* Category Filter Section */}
      <section className="category-filter-modern">
        <div className="filter-header">
          <h2 className="filter-title-modern">
            ¿Qué deseas <span className="text-highlight-modern">Cocinar</span>?
          </h2>
          <div className="decorative-line"></div>
        </div>

        <div className="category-pills">
          <button
            className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <i className="fa-solid fa-border-all"></i>
            <span>Todos</span>
          </button>
          {categoriesWithRecipes.slice(0, 10).map((category) => (
            <button
              key={category.id}
              className={`pill-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span>{category.name_category}</span>
            </button>
          ))}
          {categoriesWithRecipes.length >= 10 && (
            <Link to="/categories" className="pill-btn view-all-pill">
              <span>Ver todas</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          )}
        </div>
      </section>

      {/* Recipes Section */}
      <div className="recipes-section-modern">
        {Object.keys(categories).length === 0 ? (
          <div className="no-recipes-modern">
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <h3>No hay recetas disponibles</h3>
              <p>¡Sé el primero en compartir una deliciosa receta!</p>
            </div>
          </div>
        ) : (
          Object.entries(categories).map(([categoryName, categoryData]) => (
            <div
              key={categoryData.category_id}
              className="category-section-modern"
              id={`category-section-${categoryData.category_id}`}
            >
              <div className="section-header-modern">
                <div className="title-with-icon">
                  <div className="icon-circle">
                    <i className="fa-solid fa-heart"></i>
                  </div>
                  <h2 className="section-title-modern">{categoryName}</h2>
                </div>
                <Link
                  to={`/category/${categoryData.category_id}`}
                  className="view-all-modern"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Ver todas
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>

              <div className="carousel-modern-wrapper">
                <button
                  className="nav-arrow nav-left"
                  onClick={() => scrollCarousel(categoryData.category_id, 'left')}
                  aria-label="Anterior"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                <div
                  className="carousel-modern-container"
                  id={`carousel-${categoryData.category_id}`}
                >
                  {categoryData.recipes.slice(0, 12).map((recipe) => (
                    <div key={recipe.id} className="recipe-card-modern">
                      <div className="card-image-wrapper">
                        <Link to={`/recipe/${recipe.id}`} onClick={() => window.scrollTo(0, 0)}>
                          <img src={recipe.image} alt={recipe.title} />
                          <div className="image-overlay">
                            <span className="difficulty-tag">{recipe.difficulty}</span>
                          </div>
                        </Link>
                      </div>

                      <div className="card-content-modern">
                        <h3 className="card-title-modern">{recipe.title}</h3>
                        <div className="card-meta-modern">
                          <div className="meta-badge">
                            <i className="fa-solid fa-clock"></i>
                            <span>{recipe.prep_time_min} min</span>
                          </div>
                          <div className="meta-badge">
                            <i className="fa-solid fa-users"></i>
                            <span>{recipe.portions} porciones</span>
                          </div>
                        </div>

                        <Link
                          to={`/recipe/${recipe.id}`}
                          className="view-recipe-btn"
                          onClick={() => window.scrollTo(0, 0)}
                        >
                          <span>Ver receta completa</span>
                          <i className="fa-solid fa-arrow-right-circle"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="nav-arrow nav-right"
                  onClick={() => scrollCarousel(categoryData.category_id, 'right')}
                  aria-label="Siguiente"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón Scroll to Top */}
      <button
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  );
};