import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/home.css";
import BannerRecetas from "../assets/img/BannerRecetas.png";


const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || '';
};

export const Home = () => {
  const [categories, setCategories] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchRecipesSummary();
    
    // Listener para mostrar/ocultar botón de scroll
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Detectar si estamos en la parte superior para resetear a "Todos"
      if (window.scrollY < 50) {
        setSelectedCategory('all');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        // Invertir el orden de las categorías para mostrar las más recientes al final
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
      const sectionElement = document.getElementById(`category-section-${categoryId}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

  // Filtrar categorías que tienen recetas
  const categoriesWithRecipes = allCategories.filter((category) => {
    const categoryData = Object.values(categories).find(
      cat => cat.category_id === category.id
    );
    return categoryData && categoryData.recipes && categoryData.recipes.length > 0;
  });

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
      <section className="hero-modern">
        <div className="hero-content-modern">
          <h1 className="hero-title-modern">
            Explora <span className="text-highlight-modern">Sabores</span> Únicos
          </h1>
          <p className="hero-subtitle-modern">
            Descubre recetas deliciosas para cada momento del día
          </p>
        </div>
        <div className="hero-image-modern">
          <div className="image-decoration"></div>
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80" 
            alt="Delicious food" 
          />
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
                        <Link to={`/recipe/${recipe.id}`}>
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