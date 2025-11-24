import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/recipe_list.css"


const AdminCardRecipe = ({ recipes, title, handleDelete, handleStatusChange, icono }) => {

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
                <div className='d-flex '>
                    <i className="fa-solid fa-circle-down fa-lg mt-3 me-2 text-info"></i>
                    <p className='me-5'>{icono}</p>
                    <i className="fa-solid fa-circle-up fa-lg mt-3 me-2 text-success"></i>
                    <p>Publica la receta</p>

                </div>
            </div>

            <div className="row">
                {recipes.map((item) => (
                    <div key={item.id} className="col-12 col-md-6 col-lg-4 my-5 px-5">
                        <div className="card bg-pink shadow p-3 border border-0">
                            <img src={item.image} className="card-img-top format-image" alt={item.title} />
                            <div className="card-body">
                                <h5 className="text-center">{item.title}</h5>
                                <p className="my-2"><b>Dificultad: </b> {item.difficulty}</p>
                                <p className="my-2"><b>Creador: </b>{item.creator_name}</p>
                                <div className='d-flex justify-content-between pt-3'>
                                    <span>
                                        {item.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'published')}
                                                    className='border border-0 me-2'
                                                    title="Publicar Receta"
                                                >
                                                    <i className="fa-solid fa-circle-up fa-2xl text-success"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(item.id, 'rejected')}
                                                    className='border border-0'
                                                    title="Rechazar Receta"
                                                >
                                                    <i className="fa-solid fa-circle-down fa-2xl text-info"></i>
                                                </button>
                                            </>
                                        )}
                                        {(item.status === 'published' || item.status === 'rejected') && (
                                            <button
                                                onClick={() => handleStatusChange(item.id, 'pending')}
                                                className='border border-0'
                                                title="Revertir a Pendiente"
                                            >
                                                <i className="fa-solid fa-circle-down fa-2xl text-info"></i>
                                            </button>
                                        )}
                                    </span>
                                    <span>
                                        <Link to={"/"}><i className="fa-solid fa-book fa-lg mx-3"></i></Link>
                                        <Link to={`recipes/edit/${item.id}`}><i className="fa-solid fa-pencil fa-lg mx-3 text-success"></i></Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn p-0 border-0"
                                            title="Eliminar Receta"
                                        >
                                            <i className="fa-solid fa-trash-can fa-lg ms-3 text-danger"></i>
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminCardRecipe;