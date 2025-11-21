import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import AdminCardRecipe from './AdminCardRecipe';
import Pagination from "../components/Pagination"

const urlBase = import.meta.env.VITE_BACKEND_URL;
const RECIPES_PER_PAGE = 9;

const PublishedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0);
 
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    const getRecipesByStatus = async (status, page = 1, limit = RECIPES_PER_PAGE) => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');

        const url = `${urlBase}/admin/recipes/status?status=${status}&page=${page}&limit=${limit}`

        try {
            const response = await fetch(url, {
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
                setTotalRecipes(data.total_count);
                toast.success(`Éxito: Se cargaron ${data.recipes.length} recetas de la página ${page}.`, { duration: 1500 });
                // setCurrentPage(1);
            } else {
                throw new Error("Respuesta del servidor inválida: No se encontró el array 'recipes'.");
            }

        } catch (error) {
            console.error(`Error al obtener recetas ${status}:`, error);
            toast.error(`Error de carga. Verifica API/Network: ${error.message}`);
            setRecipes([]);
            setTotalRecipes(0);
        } finally {
            setIsLoading(false);
        }
    };



    const handleDelete = async (recipeId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta receta?")) {
            return;
        }

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${urlBase}/recipes/${recipeId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al intentar eliminar la receta.");
            }

            toast.success(data.message || "Receta eliminada exitosamente.");

            const remainingRecipesOnPage = recipes.length - 1;
            const totalPages = Math.ceil((totalRecipes - 1) / RECIPES_PER_PAGE);

            let pageToFetch = currentPage;

            if (remainingRecipesOnPage === 0 && currentPage > 1 && currentPage > totalPages) {
                pageToFetch = currentPage - 1;
                setCurrentPage(pageToFetch);
            }

            getRecipesByStatus('published', pageToFetch);

        } catch (error) {
            console.error("Error de eliminación:", error);
            toast.error(`Eliminación fallida: ${error.message}`);
        }
    };


    const handleStatusChange = async (recipeId, newStatus) => {
        const token = localStorage.getItem('access_token');

        if (!window.confirm(`¿Estás seguro de que quieres cambiar el estado de la receta a ${newStatus}?`)) {
            return;
        }

        try {
            const response = await fetch(`${urlBase}/admin/recipes/${recipeId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ new_status: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al cambiar el estado a ${newStatus}.`);
            }

            toast.success(data.message || `Receta actualizada a estado: ${newStatus}.`, { duration: 1500 });

            const remainingRecipesOnPage = recipes.length - 1; // Recetas que quedan VISIBLES en el cliente
            const totalPages = Math.ceil((totalRecipes - 1) / RECIPES_PER_PAGE); // Total de páginas DESPUÉS de la operación

            let pageToFetch = currentPage;

            // Caso especial: Si el cambio de estado resulta en que la página actual se vacía
            if (remainingRecipesOnPage === 0 && currentPage > 1 && currentPage > totalPages) {
                pageToFetch = currentPage - 1; // Volver a la página anterior
                setCurrentPage(pageToFetch); // Actualiza el estado de la página para el componente Pagination
            }

            getRecipesByStatus('published', pageToFetch);

        } catch (error) {
            console.error("Error de cambio de estado:", error);
            toast.error(`Fallo al actualizar el estado: ${error.message}`);
        }
    };

    useEffect(() => {
        getRecipesByStatus('published', currentPage);
    }, [currentPage]);



    if (isLoading) {
        return <div className="text-center p-5">Cargando recetas...</div>;
    }


    return (
        <>
            <Toaster position="top-right" richColors />
            <AdminCardRecipe
                recipes={recipes}
                title="Recetas Publicadas"
                icono= "= devuelve la receta a pendientes"
                handleDelete={handleDelete}
                handleStatusChange={handleStatusChange}
            />
            <Pagination
                recipesPerPage={RECIPES_PER_PAGE}
                totalRecipes={totalRecipes}
                currentPage={currentPage}
                paginate={paginate}
            />
        </>
    );
}

export default PublishedRecipes;