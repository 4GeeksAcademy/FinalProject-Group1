import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/recipeDetail.css';
import BannerRecetas from "../assets/img/BannerRecetas.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Comment from './Comment';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const RecipeDetail = () => {
  const { recipeId } = useParams();

  const { store } = useGlobalReducer();
  const token = store.token;

  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);


  if (!token) {
    return (
      <div className='info'>
        <Link to="/" className="back-button positions">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>

        <img
          src={BannerRecetas}
          alt="pareja cocinando"
          className='image-sesion'
        />

        <h1 className='title-sesion '>
          <i className="fa-solid fa-lock pe-4" ></i>
          Acceso Requerido
        </h1>

        <p className='comment-sesion'>
          **Debes iniciar sesión para ver los detalles de la receta.**
        </p>

        <div className="action-buttons">
          {/* Botón para ir a Iniciar Sesión */}
          <Link
            to="/login"
            className="btn btn-warning btn-sesion"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }


  if (!recipeId) {
    return (
      <div className="recipe-detail-container">
        <Link to="/" className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <p>Esperando ID de la receta...</p>
      </div>
    );
  }

  // Detalle de receta
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);

      if (!recipeId) {
        console.error("Error: recipeId es indefinido. No se puede cargar la receta.");
        setLoading(false);
        return; // Detiene la ejecución del fetch
      }
      try {
        const res = await fetch(`${BACKEND_URL}/recetas/${recipeId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const text = await res.text();

        if (!res.ok) {
          let message = 'Error al cargar la receta';
          try {
            const errData = JSON.parse(text);
            if (errData?.message) message = errData.message;
          } catch {
          }

          if (res.status === 404) {
            message = 'Receta no encontrada';
          }

          throw new Error(message);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Respuesta inválida del servidor (no es JSON)');
        }

        setRecipe(data);
        setIsFavorite(Boolean(data.is_favorite));
        setUserRating(data.user_rating || 0);
      } catch (err) {
        console.error('Error en fetchRecipe:', err);
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    if (token && recipeId) {
      fetchRecipe();
    }
  }, [recipeId, token]);


  const handleRate = async (ratingValue) => {
    if (!token) {
      alert('Debes iniciar sesión para calificar.');
      return;
    }
    if (isRatingLoading) return; // Evita clics dobles

    setIsRatingLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/recipe/${recipeId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: ratingValue }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta inválida del servidor al calificar');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar la calificación');
      }

      setUserRating(ratingValue);

      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        avg_rating: data.avg_rating,
        vote_count: data.vote_count,
      }));

      console.log(data.message);
    } catch (err) {
      console.error('Error al calificar:', err);
      alert(err.message || 'Error al calificar la receta.');
    } finally {
      setIsRatingLoading(false);
    }
  };

  // Favoritos
  const handleToggleFavorite = async () => {
    if (!token) {
      alert('Debes iniciar sesión para añadir a favoritos.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/recetas/${recipeId}/favorito`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta inválida del servidor al actualizar favorito');
      }

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar favorito');
      }

      setIsFavorite(Boolean(data.is_favorite));
    } catch (err) {
      console.error('Error en favorito:', err);
      alert(err.message || 'Error al actualizar favorito');
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-container">
        <Link to="/" className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <p>Cargando receta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-container">
        <Link to="/" className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <div className="error-container">
          <h2>Ups, algo salió mal</h2>
          <p className="text-muted">{error}</p>
          <Link to="/" className="btn btn-warning">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-container">
        <Link to="/" className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <div className="error-container">
          <h2>Receta no encontrada</h2>
          <p className="text-muted">
            La funcionalidad será implementada próximamente
          </p>
          <Link to="/" className="btn btn-warning">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    difficulty,
    prep_time_min,
    portions,
    category_name,
    avg_rating,
    vote_count,
    image,
    ingredients = [],
    steps,
    nutritional_data,
  } = recipe;

  const stepsList = steps
    ? steps.split('\n').filter((step) => step.trim())
    : [];

  return (
    <div className="recipe-detail-container">
      <Link to="/" className="back-button">
        <i className="bi bi-arrow-left"></i> Volver
      </Link>

      <div className="recipe-hero">
        <div className="recipe-hero-content">
          <h1 className="recipe-detail-title">{title}</h1>

          <div className="recipe-badges">
            <span className="badge-item difficulty">
              <i className="bi bi-speedometer2"></i> {difficulty}
            </span>
            <span className="badge-item">
              <i className="bi bi-clock"></i> {prep_time_min} min
            </span>
            <span className="badge-item">
              <i className="bi bi-people"></i> {portions} porciones
            </span>
            <span className="badge-item category">
              <i className="bi bi-tag"></i> {category_name}
            </span>
          </div>

          <div className="recipe-detail-rating recipe-global-rating"
            onMouseLeave={() => token && setHoverRating(0)}>
            <div className={`stars ${token ? 'stars-interactive' : ''} ${isRatingLoading ? 'disabled' : ''}`}>
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                const displayValue = hoverRating 
                  || userRating
                  || (token ? 0 : (recipe.avg_rating || 0));
                return (
                  <i
                    key={`avg-${i}`}
                    className={`bi ${starValue <= displayValue
                      ? 'bi-star-fill'
                      : 'bi-star'
                      } ${token ? 'clickable star-item' : ''}`} 
                    onMouseEnter={() => token && setHoverRating(starValue)}
                    onClick={() => token && handleRate(starValue)}
                  ></i>
                );
              })}
            </div>
            <span className="rating-text">
              Promedio: {(recipe.avg_rating || 0).toFixed(1)} | Votos: {recipe.vote_count || 0}
            </span>
          </div>
          <div className='mt-4'>
            <button
              type="button"
              className="badge-item"
              onClick={handleToggleFavorite}
              disabled={!token}
              style={{ cursor: token ? 'pointer' : 'not-allowed' }}
            >
              <i
                className={
                  isFavorite ? 'bi bi-star-fill' : 'bi bi-star'
                }
              ></i>
              {isFavorite
                ? ' Quitar de favoritos'
                : ' Añadir a favoritos'}
            </button>
          </div>
        </div>

        <div className="recipe-hero-image">
          <img src={image} alt={title} />
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <h2 className="section-title">
            <i className="bi bi-basket"></i> Ingredientes
          </h2>
          <div className="ingredients-list">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-item">
                <span className="ingredient-bullet">•</span>
                <span className="ingredient-name">
                  {ingredient.name}
                </span>
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
            {stepsList.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {nutritional_data && (
        <div className="nutritional-section">
          <h2 className="section-title">
            <i className="bi bi-heart-pulse"></i> Información Nutricional
          </h2>
          <div className="nutritional-content">
            <p>{nutritional_data}</p>
          </div>
        </div>
      )}

      <Comment recipeId={recipeId} />

    </div>
  );
};