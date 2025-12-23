import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/recipe_list.css"


const AdminCardRecipe = ({ recipes, title, handleDelete, handleStatusChange, icono }) => {

    if (!recipes || recipes.length === 0) {
        return (
            <div className="container text-center my-5 py-5 border rounded shadow-sm bg-white">
                <div className="p-4">
                    <div className="mb-4">
                        <i className="fa-solid fa-circle-check fa-5x text-success"></i>
                    </div>
                    <h1 className="display-6 fw-bold text-dark">¡Buen trabajo, Profe!</h1>
                    <p className="lead text-muted">
                        No hay recetas pendientes en la categoría: <strong>{title}</strong>. <br />
                        Todo está bajo control por ahora.
                    </p>
                    <div className="mt-4">
                        <span className="badge rounded-pill bg-success p-2 px-4">
                            <i className="fa-solid fa-star me-2"></i>
                            Sistema al día
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container published p-5">
            <div className="row">
                <div className="col-12 d-flex justify-content-center text-center my-3 shadow title-rl">
                    <h1>{title}</h1>
                </div>
                <div className='d-flex mb-4'>
                    <i className="fa-solid fa-circle-down fa-lg mt-3 me-2 text-info"></i>
                    <p className='me-5'>{icono} Rechazar/Revertir</p>
                    <i className="fa-solid fa-circle-up fa-lg mt-3 me-2 text-success"></i>
                    <p>Publicar la receta</p>
                </div>
            </div>

            <div className="row d-flex justify-content-start">
                {recipes.map((item) => (
                    <div key={item.id} className="col-12 col-sm-10 col-md-6 col-lg-4 my-3 px-4">
                        <div className="card bg-pink shadow p-3 border border-0 h-100">
                            <img
                                src={item.image}
                                className="card-img-top format-image"
                                alt={item.title}
                                style={{ height: "200px", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=500&auto=format&fit=crop";
                                }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="text-center fw-bold">{item.title}</h5>
                                <p className="my-2"><b>Dificultad: </b> {item.difficulty}</p>
                                <p className="my-0"><b>Creador: </b>{item.creator_name}</p>

                                <div className='d-flex justify-content-between mt-auto pt-3'>
                                    <span>
                                        {item.status === 'pending' ? (
                                            <>
                                                <button onClick={() => handleStatusChange(item.id, 'published')} className='btn p-0 me-2' title="Publicar">
                                                    <i className="fa-solid fa-circle-up fa-2xl text-success"></i>
                                                </button>
                                                <button onClick={() => handleStatusChange(item.id, 'rejected')} className='btn p-0' title="Rechazar">
                                                    <i className="fa-solid fa-circle-down fa-2xl text-info"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleStatusChange(item.id, 'pending')} className='btn p-0' title="Revertir">
                                                <i className="fa-solid fa-circle-down fa-2xl text-info"></i>
                                            </button>
                                        )}
                                    </span>
                                    <span>
                                        <Link to={`/recipe/${item.id}`} className="text-dark"><i className="fa-solid fa-book fa-lg mx-2"></i></Link>
                                        <Link to={`/recipes/edit/${item.id}`} className="text-success"><i className="fa-solid fa-pencil fa-lg mx-2"></i></Link>
                                        <button onClick={() => handleDelete(item.id)} className="btn p-0 border-0 text-danger" title="Eliminar">
                                            <i className="fa-solid fa-trash-can fa-lg mx-2"></i>
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