import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/recipe_list.css" 


const AdminCardRecipe = ({ recipes, title }) => {
    
    if (!recipes || recipes.length === 0) {
        return (
            <div className="container published p-5 text-center">
                <div className="col-12 d-flex justify-content-center text-center my-3 shadow title-rl">
                    <h1>{title}</h1>
                </div>
                <p className="mt-5 lead">No hay recetas en esta categoría para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="container published p-5">
            <div className="row">
                <div className="col-12 d-flex justify-content-center text-center my-3 shadow title-rl">
                    <h1>{title}</h1>
                </div>
            </div>

            <div className="row">
                {recipes.map((item) => (
                    <div key={item.id} className="col-12 col-md-6 col-lg-4 my-5 px-5">
                        <div className="card bg-pink shadow p-3 border border-0">
                            <img src={item.image} className="card-img-top format-image" alt={item.title} />
                            <div className="card-body">
                                <h5 className="card-title">{item.title}</h5>
                                <p className="card-text">Dificultad: {item.difficulty}</p>
                                <span className='d-flex justify-content-end'>
                                    <Link to={`/admin/receta/${item.id}`}><i className="fa-solid fa-book fa-lg mx-3 text-success"></i></Link>
                                    <i className="fa-solid fa-pencil fa-lg mx-3 text-primary"></i>
                                    <i className="fa-solid fa-trash-can fa-lg ms-3 text-danger"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminCardRecipe;