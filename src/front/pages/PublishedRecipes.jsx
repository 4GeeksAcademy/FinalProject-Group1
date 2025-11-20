import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import AdminCardRecipe from './AdminCardRecipe';

const urlBase = import.meta.env.VITE_BACKEND_URL;

const PublishedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getRecipesByStatus = async (status) => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${urlBase}/admin/recipes/status?status=${status}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.recipes && Array.isArray(data.recipes)) {
                setRecipes(data.recipes);
                toast.success(`Éxito: Se cargaron ${data.recipes.length} recetas ${status}.`, { duration: 1500 });
            } else {
                throw new Error("Respuesta del servidor inválida: No se encontró el array 'recipes'.");
            }

        } catch (error) {
            console.error(`Error al obtener recetas ${status}:`, error);
            toast.error(`Error de carga. Verifica API/Network: ${error.message}`);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getRecipesByStatus('published');
    }, []);


    if (isLoading) {
        return <div className="text-center p-5">Cargando recetas...</div>;
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <AdminCardRecipe
                recipes={recipes}
                title="Recetas Publicadas"
            />
        </>
    );
}

export default PublishedRecipes;