import React, { useState, useEffect } from 'react';

const urlBase = import.meta.env.VITE_BACKEND_URL


function Categorias() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const response = await fetch(`${urlBase}/categories`);

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                setCategories(data);

            } catch (err) {
                console.error("Error al obtener las categorías:", err);
                setError("No se pudieron cargar las categorías. Revisa la consola y tu API.");
            } finally {
                setLoading(false);
            }
        };

        obtenerCategorias();
    }, []);


    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <p>Cargando categorías...</p>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    No hay categorías para mostrar.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <header className="text-center mb-4">
                <h3 className="display-4">Listado de Categorías</h3>
            </header>

            <ul className="list-group">
                {categories.map((category) => (
                    <div className="container d-flex justify-content-center">
                        <div className='row col-6'>
                            <li
                                key={category.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                {category.name_category}
                                <span className="badge bg-primary rounded-pill">ID: {category.id}</span>
                            </li>
                        </div>
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default Categorias;