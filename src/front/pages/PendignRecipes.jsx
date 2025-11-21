import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import AdminCardRecipe from './AdminCardRecipe';
import Pagination from "../components/Pagination"

const urlBase = import.meta.env.VITE_BACKEND_URL;
const RECIPES_PER_PAGE = 9;

const PendingRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                setCurrentPage(1);
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

            getRecipesByStatus('pending');

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

            getRecipesByStatus('pending', currentPage);

        } catch (error) {
            console.error("Error de cambio de estado:", error);
            toast.error(`Fallo al actualizar el estado: ${error.message}`);
        }
    };


    useEffect(() => {
        getRecipesByStatus('pending');
    }, []);


    const currentRecipes = useMemo(() => {
        const indexOfLastRecipe = currentPage * RECIPES_PER_PAGE;
        const indexOfFirstRecipe = indexOfLastRecipe - RECIPES_PER_PAGE;
        return recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    }, [recipes, currentPage]);


    if (isLoading) {
        return <div className="text-center p-5">Cargando recetas...</div>;
    }




    return (
        <>
            <Toaster position="top-right" richColors />
            <AdminCardRecipe
                recipes={currentRecipes}
                title="Recetas Pendientes"
                icono="= devuelve la receta a rechazadas"
                handleDelete={handleDelete}
                handleStatusChange={handleStatusChange}
            />
            <Pagination
                recipesPerPage={RECIPES_PER_PAGE}
                totalRecipes={recipes.length}
                currentPage={currentPage}
                paginate={paginate}
            />
        </>
    );
}

export default PendingRecipes;