import React, { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const NutritionalData = ({ recipeId, token }) => {
    const [nutritionData, setNutritionData] = useState(null);
    const [nutritionLoading, setNutritionLoading] = useState(true);
    const [nutritionError, setNutritionError] = useState(null);

    useEffect(() => {
        const fetchNutrition = async () => {
            setNutritionLoading(true);
            setNutritionError(null);

            try {
                const res = await fetch(`${BACKEND_URL}/recetas/${recipeId}/nutricional`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!res.ok) {
                    throw new Error('No se pudo obtener la información nutricional');
                }

                const data = await res.json();
                setNutritionData(data);

            } catch (err) {
                console.error("Error al cargar nutrición:", err);
                setNutritionError(err.message);
            } finally {
                setNutritionLoading(false);
            }
        };

        if (recipeId) {
            fetchNutrition();
        }
    }, [recipeId, token]);

    if (nutritionLoading) {
        return (
            <div className="summary-nutritional-section mt-5 p-4 border rounded shadow-sm text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-muted">Calculando datos nutricionales...</p>
            </div>
        );
    }

    if (nutritionError || !nutritionData || !nutritionData.total_nutrition) {
        return (
            <div className="summary-nutritional-section mt-5 p-4 border rounded shadow-sm text-center bg-light">
                <p className="text-warning mb-0">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> Datos nutricionales no disponibles.
                </p>
            </div>
        );
    }

    const { total_nutrition, source } = nutritionData;

    return (
        <div className="summary-nutritional-section mt-5 p-4 border rounded shadow-sm">
            <h2 className="section-title text-center text-primary mb-4">
                <i className="bi bi-heart-pulse me-2"></i> Información Nutricional (por porción)
            </h2>
            <div className="row text-center">
                <div className="col-6 col-md-3 mb-3"><div className="data-box p-2 bg-light rounded"><h4 className="fw-bold mb-0">{total_nutrition.calories.toFixed(2)}</h4><p className="text-muted small mb-0">Calorías (Kcal)</p></div></div>
                <div className="col-6 col-md-3 mb-3"><div className="data-box p-2 bg-light rounded"><h4 className="fw-bold mb-0">{total_nutrition.carbs.toFixed(2)}g</h4><p className="text-muted small mb-0">Carbohidratos</p></div></div>
                <div className="col-6 col-md-3 mb-3"><div className="data-box p-2 bg-light rounded"><h4 className="fw-bold mb-0">{total_nutrition.fat.toFixed(2)}g</h4><p className="text-muted small mb-0">Grasas</p></div></div>
                <div className="col-6 col-md-3 mb-3"><div className="data-box p-2 bg-light rounded"><h4 className="fw-bold mb-0">{total_nutrition.protein.toFixed(2)}g</h4><p className="text-muted small mb-0">Proteínas</p></div></div>
            </div>
            <p className='text-center text-secondary small mt-3'>
                *Cálculos basados en {source || 'USDA'}
            </p>
        </div>
    );
};