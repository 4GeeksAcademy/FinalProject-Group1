import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/recipeDetail.css';

export const RecipeDetail = () => {
  // TODO: Implementar lógica de fetch por otro desarrollador
  // Usar: import.meta.env.VITE_BACKEND_URL para la API URL
  
  const recipe = null; // Placeholder - conectar con API

  if (!recipe) {
    return (
      <div className="recipe-detail-container">
        <Link to="/" className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <div className="error-container">
          <h2>Receta no encontrada</h2>
          <p className="text-muted">La funcionalidad será implementada próximamente</p>
          <Link to="/" className="btn btn-warning">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail-container">
      <Link to="/" className="back-button">
        <i className="bi bi-arrow-left"></i> Volver
      </Link>

      <div className="recipe-hero">
        <div className="recipe-hero-content">
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          
          <div className="recipe-badges">
            <span className="badge-item difficulty">
              <i className="bi bi-speedometer2"></i> {recipe.difficulty}
            </span>
            <span className="badge-item">
              <i className="bi bi-clock"></i> {recipe.prep_time_min} min
            </span>
            <span className="badge-item">
              <i className="bi bi-people"></i> {recipe.portions} porciones
            </span>
            <span className="badge-item category">
              <i className="bi bi-tag"></i> {recipe.category_name}
            </span>
          </div>

          {recipe.avg_rating && (
            <div className="recipe-detail-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i}
                    className={`bi ${i < Math.round(recipe.avg_rating) ? 'bi-star-fill' : 'bi-star'}`}
                  ></i>
                ))}
              </div>
              <span className="rating-text">
                {recipe.avg_rating.toFixed(1)} ({recipe.vote_count} valoraciones)
              </span>
            </div>
          )}
        </div>

        <div className="recipe-hero-image">
          <img src={recipe.image} alt={recipe.title} />
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h2 className="section-title">
            <i className="bi bi-basket"></i> Ingredientes
          </h2>
          <div className="ingredients-list">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-item">
                <span className="ingredient-bullet">•</span>
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-quantity">
                  {ingredient.quantity} {ingredient.unit_measure}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="steps-section">
          <h2 className="section-title">
            <i className="bi bi-list-ol"></i> Preparación
          </h2>
          <div className="steps-content">
            {recipe.steps.split('\n').filter(step => step.trim()).map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recipe.nutritional_data && (
        <div className="nutritional-section">
          <h2 className="section-title">
            <i className="bi bi-heart-pulse"></i> Información Nutricional
          </h2>
          <div className="nutritional-content">
            <p>{recipe.nutritional_data}</p>
          </div>
        </div>
      )}
    </div>
  );
};