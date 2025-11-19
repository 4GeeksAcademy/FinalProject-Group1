import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Link } from 'react-router-dom';
import "../styles/recipe_list.css"

const urlBase = import.meta.env.VITE_BACKEND_URL;

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
 
    const getAllRecipes = async () => {
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
        }
    };
 

    useEffect(() => {
        getAllRecipes();
    }, []);
 
 
    return (
        <div className="container published p-5">
            <div className="row">
                <div className="col-12 d-flex justify-content-center text-center my-3 shadow title-rl">
                    <h1>Recetas publicadas</h1>
                </div>
                {
                    recipes.map((item) => {
                        return (
                            <div key={item.id} className="col-12 col-md-6 col-lg-4 my-5 px-5">
                                <div className="card bg-pink shadow p-3 border border-0">
                                    <img src={item.image} className="card-img-top format-image" alt="receta" />
                                    <div className="card-body">
                                        <h5 className="card-title">{item.title}</h5>
                                        <p className="card-text">{item.difficulty}</p>

                                        <span className='d-flex justify-content-end'>
                                            <i className="fa-solid fa-book fa-lg mx-3"></i>
                                            <i className="fa-solid fa-pencil fa-lg mx-3"></i>
                                            <i className="fa-solid fa-trash-can fa-lg ms-3"></i>
                                        </span>
                                        {/* <Link to={"/"} className="btn btn-outline-success">Elimina</Link> */}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default RecipeList;