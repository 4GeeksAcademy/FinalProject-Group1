import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';

const urlBase = import.meta.env.VITE_BACKEND_URL;

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${urlBase}/recipes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.recipes && Array.isArray(data.recipes)) {
                setRecipes(data.recipes);
                toast.success(`Éxito: Se cargaron ${data.recipes.length} recetas publicadas.`, { duration: 1500 });
            } else {
                throw new Error("Respuesta del servidor inválida: No se encontró el array 'recipes'.");
            }

        } catch (error) {
            console.error("Error al obtener recetas:", error);
            toast.error(`Error de carga. Verifica API/Network: ${error.message}`);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchRecipes();
    }, []);


    return (
        <div className="container pt-5">
            <Toaster position="top-center" richColors />
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <h1 className="text-center bg-info-subtle p-3 mb-4 rounded-lg shadow-sm">
                        Recetas Publicadas
                    </h1>
                    {loading && (
                        <div className="text-center my-5">
                            <span className="spinner-border spinner-border-lg text-primary" role="status"></span>
                            <p className="mt-2 text-primary">Cargando recetas...</p>
                        </div>
                    )}
                    {!loading && recipes.length > 0 && (
                        <ul className="list-group shadow-lg">
                            {recipes.map((recipe) => (
                                <li
                                    key={recipe.id}
                                    className="list-group-item list-group-item-action fw-bold"
                                >
                                    {recipe.title}
                                </li>
                            ))}
                        </ul>
                    )}

                    {!loading && recipes.length === 0 && (
                        <div className="alert alert-warning text-center">
                            ¡Parece que no hay recetas con estado "published" aún!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeList;