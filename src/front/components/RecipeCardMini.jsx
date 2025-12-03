import React from "react";
import { Link } from "react-router-dom";

export const RecipeCardMini = ({ recipe }) => {
  return (
    <div className="recipe-card-modern">
      <div className="card-image-wrapper">
        <Link to={`/recipe/${recipe.id}`} onClick={() => window.scrollTo(0, 0)}>
          <img src={recipe.image} alt={recipe.title} />
          <div className="image-overlay">
            <span className="difficulty-tag">{recipe.difficulty}</span>
          </div>
        
          {recipe.is_favorite && (
            <div className="favorite-badge heart-badge">
              <i className="fa-solid fa-heart"></i>
            </div>
          )}
          
          {recipe.is_top_rated && (
            <div className={`favorite-badge star-badge ${!recipe.is_favorite ? 'single-badge' : ''}`}>
              <i className="fa-solid fa-star"></i>
            </div>
          )}
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
  );
};