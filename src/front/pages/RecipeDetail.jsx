import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/recipeDetail.css';
import BannerRecetas from "../assets/img/BannerRecetas.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Comment from './Comment';
import { NutritionalData } from './NutritionalData';

const ALL_CONVERSION_UNITS = [
  { label: "Unidades Originales", value: "original" },
  { label: "Gramos (g)", value: "g" },
  { label: "Kilogramos (kg)", value: "kg" },
  { label: "Libras (lb)", value: "lb" },
  { label: "Onzas (oz)", value: "oz" },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const RecipeDetail = () => {
  const { recipeId } = useParams();

  const { store } = useGlobalReducer();
  const token = store.token;

  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversionUnit, setConversionUnit] = useState("original");
  const [loadingIngredients, setLoadingIngredients] = useState(false);

  const [recipeLoaded, setRecipeLoaded] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [desiredPortions, setDesiredPortions] = useState(0);


  if (!token) {
    return (
      <div className='info'>
        <Link to={-1} className="back-button positions">
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
          *Debes iniciar sesión para ver los detalles de la receta.*
        </p>

        <div className="action-buttons">
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
        <Link to={-1} className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <p>Esperando ID de la receta...</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      setRecipeLoaded(false);

      if (!recipeId || !token) {
        console.error("Error: recipeId o token es indefinido.");
        setLoading(false);
        return;
      }

      const url = `${BACKEND_URL}/recetas/${recipeId}`;

      try {
        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Respuesta inválida del servidor (no es JSON)');
        }

        if (!res.ok) {
          let message = data?.message || 'Error al cargar la receta';
          if (res.status === 404) {
            message = 'Receta no encontrada';
          }
          throw new Error(message);
        }

        data.ingredients_original = data.ingredients;

        setRecipe(data);
        setIsFavorite(Boolean(data.is_favorite));
        setUserRating(data.user_rating || 0);
        setRecipeLoaded(true);

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


  useEffect(() => {
    if (!recipe || !recipeId || !token) return;

    if (conversionUnit === "original") {
      setRecipe(prevRecipe => {
        if (!prevRecipe.ingredients_original) return prevRecipe;
        return {
          ...prevRecipe,
          ingredients: prevRecipe.ingredients_original
        };
      });
      return;
    }

    const fetchConvertedIngredients = async () => {
      setLoadingIngredients(true);

      const url = `${BACKEND_URL}/recetas/${recipeId}/ingredientes?unit=${conversionUnit}`;

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = JSON.parse(await res.text());
        if (!res.ok) throw new Error(data.message || 'Error al convertir ingredientes');

        setRecipe(prevRecipe => {
          const ingredientsOriginal = prevRecipe.ingredients_original || prevRecipe.ingredients;

          return {
            ...prevRecipe,
            ingredients: data,
            ingredients_original: ingredientsOriginal
          };
        });

      } catch (err) {
        console.error('Error en fetchConvertedIngredients:', err);
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchConvertedIngredients();

  }, [recipeId, token, conversionUnit]);

  const handleRate = async (ratingValue) => {
    if (!token) {
      alert('Debes iniciar sesión para calificar.');
      return;
    }

    if (isRatingLoading) return;
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


  useEffect(() => {
    if (recipe) {
      setDesiredPortions(recipe.portions);
    }
  }, [recipeLoaded]);

  const getScaledQuantity = (originalQuantity) => {
    if (!recipe || !recipe.portions) return originalQuantity;
    const scaled = (originalQuantity / recipe.portions) * desiredPortions;
    return parseFloat(scaled.toFixed(2)); 
  };


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
      if (window.refreshFavoritesCount) {
        window.refreshFavoritesCount();
      }
    } catch (err) {
      console.error('Error en favorito:', err);
      alert(err.message || 'Error al actualizar favorito');
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-container">
        <Link to={-1} className="back-button">
          <i className="bi bi-arrow-left"></i> Volver
        </Link>
        <p>Cargando receta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipe-detail-container">
        <Link to={-1} className="back-button">
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
        <Link to={-1} className="back-button">
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
    creator_name,
    avg_rating,
    vote_count,
    image,
    ingredients = [],
    steps,
    is_published = false,
    comments = [],
  } = recipe;

  const stepsList = steps
    ? steps.split('\n').filter((step) => step.trim())
    : [];

  return (
    <div className="recipe-detail-container">
      <Link to={-1} className="back-button">
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
              <i className="bi bi-people"></i>
              <input
                type="number"
                min="1"
                value={desiredPortions}
                onChange={(e) => setDesiredPortions(parseInt(e.target.value) || 1)}
                style={{ width: '50px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
              /> porciones
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
                className={`
                  bi 
                  ${isFavorite ? "bi-heart-fill" : "bi-heart"} 
                  favorite-icon 
                  ${isFavorite ? "active" : ""}
                  `.trim()}
              />

              {isFavorite
                ? ' Quitar de favoritos'
                : ' Añadir a favoritos'}
            </button>
          </div>
          <span className="badge-item mt-3">
            <i className="fa-solid fa-person"></i> Sugerido por: {creator_name}
          </span>
        </div>

        <div className="recipe-hero-image">
          <img src={image} alt={title} />
        </div>
      </div>

      <div className="recipe-content">
        <div className="ingredients-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title mb-0">
              <i className="bi bi-basket"></i> Ingredientes
            </h2>

            <div className="portions-stepper">
              <span className="me-2 text-muted small">Porciones:</span>
              <button
                className="btn-stepper"
                onClick={() => setDesiredPortions(Math.max(1, desiredPortions - 1))}
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="portion-number">{desiredPortions}</span>
              <button
                className="btn-stepper"
                onClick={() => setDesiredPortions(desiredPortions + 1)}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>

          <div className="unit-converter-selector mb-4">
            <label htmlFor="unitSelect" className="form-label d-block fw-bold text-success small">
              Mostrar masa en:
            </label>
            <select
              id="unitSelect"
              className="form-select form-select-sm w-auto"
              value={conversionUnit}
              onChange={(e) => setConversionUnit(e.target.value)}
            >
              {ALL_CONVERSION_UNITS.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>

          <div className="ingredients-list">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-item">
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-quantity">
                  {((ingredient.quantity / recipe.portions) * desiredPortions).toFixed(2)} {ingredient.unit_measure}
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
      {is_published && (
        <NutritionalData recipeId={recipeId} token={token} />
      )}

      {is_published && (
        <Comment
          recipeId={recipeId}
          initialComments={comments}
          isPublished={is_published}
        />
      )}

    </div>
  );
};