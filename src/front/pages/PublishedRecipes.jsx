import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import AdminCardRecipe from './AdminCardRecipe';
import Pagination from "../components/Pagination"

const urlBase = import.meta.env.VITE_BACKEND_URL;
const RECIPES_PER_PAGE = 9;
const STATUS_TYPE = 'published';

const PublishedRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecipes, setTotalRecipes] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    const getRecipesByStatus = async (status, page = 1, limit = RECIPES_PER_PAGE) => {
        if (!isSearching) setIsLoading(true);
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
            } else {
                throw new Error("Respuesta del servidor inválida: No se encontró el array 'recipes'.");
            }

        } catch (error) {
            console.error(`Error al obtener recetas ${status}:`, error);
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

            getRecipesByStatus(STATUS_TYPE, pageToFetch);

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

            const remainingRecipesOnPage = recipes.length - 1;
            const totalPages = Math.ceil((totalRecipes - 1) / RECIPES_PER_PAGE);

            let pageToFetch = currentPage;
            if (remainingRecipesOnPage === 0 && currentPage > 1 && currentPage > totalPages) {
                pageToFetch = currentPage - 1;
                setCurrentPage(pageToFetch);
            }

            getRecipesByStatus(STATUS_TYPE, pageToFetch);

        } catch (error) {
            console.error("Error de cambio de estado:", error);
            toast.error(`Fallo al actualizar el estado: ${error.message}`);
        }
    };

    useEffect(() => {
        if (!isSearching) {
            getRecipesByStatus(STATUS_TYPE, currentPage);
        }
    }, [currentPage]);


    useEffect(() => {
        let controller = null;
        let timer = null;
        if (searchTerm.length >= 2) {
            setLoadingSearch(true);
            setIsSearching(true);

            controller = new AbortController();
            const signal = controller.signal;

            timer = setTimeout(async () => {
                const token = localStorage.getItem('access_token');

                try {
                    const url = `${urlBase}/admin/recipes/search_by_status?q=${searchTerm}&status=${STATUS_TYPE.toUpperCase()}`;

                    const response = await fetch(url, {
                        headers: { "Authorization": `Bearer ${token}` },
                        signal: signal
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al buscar en el panel.');
                    }

                    const data = await response.json();
                    setSearchResults(data.recipes || []);


                } catch (error) {
                    if (error.name === 'AbortError') {
                        return;
                    }
                    console.error('Error fetching admin search results:', error);
                    toast.error(`Error en búsqueda: ${error.message}`);
                    setSearchResults([]);
                } finally {
                    setLoadingSearch(false);
                }
            }, 500);

            return () => {
                clearTimeout(timer);
                controller.abort();
            };

        } else {

            if (isSearching) {
                setIsSearching(false);
            }

            setSearchResults([]);
            setLoadingSearch(false);
        }

    }, [searchTerm]);

    const recipesToDisplay = isSearching ? searchResults : recipes;
    const totalItems = isSearching ? recipesToDisplay.length : totalRecipes;
    if (isLoading) {
        return <div className="text-center p-5">Cargando recetas del panel de Publicadas...</div>;
    }


    return (
        <>
            <Toaster position="top-right" richColors />

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="input-group mb-3 shadow">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por título en Recetas Publicadas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {loadingSearch && (
                                <span className="input-group-text text-primary">
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                </span>
                            )}
                            {searchTerm && (
                                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            )}
                            <span className="input-group-text">
                                <i className="fa-solid fa-search"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <AdminCardRecipe
                recipes={recipesToDisplay}
                title={isSearching ? `Resultados para "${searchTerm}"` : "Recetas Publicadas"}
                icono="= devuelve la receta a pendientes"
                handleDelete={handleDelete}
                handleStatusChange={handleStatusChange}
            />

            {!isSearching && (
                <Pagination
                    recipesPerPage={RECIPES_PER_PAGE}
                    totalRecipes={totalItems}
                    currentPage={currentPage}
                    paginate={paginate}
                />
            )}

            {isSearching && recipesToDisplay.length === 0 && (
                <div className="container published p-5 text-center">
                    <p className="mt-5 lead">No se encontraron recetas Publicadas con ese título.</p>
                </div>
            )}
        </>
    );
}

export default PublishedRecipes;