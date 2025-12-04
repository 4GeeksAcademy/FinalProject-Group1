import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/recipe_list.css"

const UserCardRecipe = ({ recipe, onDelete }) => {

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published': return <span className="badge bg-success">Publicada</span>;
            case 'pending': return <span className="badge bg-warning text-dark">En Revisión</span>;
            case 'rejected': return <span className="badge bg-danger">Rechazada</span>;
            default: return null;
        }
    };

    return (
        <div className="col-12 col-sm-6 col-md-6 col-lg-4 my-4 px-3">
            <div className="card bg-pink shadow py-2 mx-4">
                <div className="d-flex text-center justify-content-center p-2">
                    <div className="image-container-fixed">
                        <img
                            src={recipe.image}
                            className="card-img-top format-image d-flex text-center"
                            alt={recipe.title}
                        />
                    </div>
                </div>

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-center fw-bold">{recipe.title}</h5>
                    <p className="card-text small text-muted text-center">
                        <i className="fa-solid fa-layer-group me-1"></i> {recipe.category_name || "Categoría"}
                    </p>
                    <div className="mt-auto d-flex justify-content-around align-items-center pt-3 border-top border-white">
                        <Link to={`/recipe/${recipe.id}`} title="Ver Receta">
                            <i className="fa-solid fa-eye fa-lg text-primary cursor-pointer"></i>
                        </Link>
                        {recipe.status === 'pending' && (
                            <>
                                <Link to={`/recipes/edit/${recipe.id}`} title="Editar">
                                    <i className="fa-solid fa-pencil fa-lg text-success cursor-pointer"></i>
                                </Link>
                                <button onClick={() => onDelete(recipe.id)} className="btn p-0 border-0" title="Eliminar">
                                    <i className="fa-solid fa-trash-can fa-lg text-danger"></i>
                                </button>
                            </>
                        )}
                        {recipe.status === 'rejected' && (
                            <>
                                <Link to={`/recipes/edit/${recipe.id}`} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                    <i className="fa-solid fa-rotate-right me-2"></i>Corregir
                                </Link>
                                <button onClick={() => onDelete(recipe.id)} className="btn p-0 border-0" title="Eliminar">
                                    <i className="fa-solid fa-trash-can fa-lg text-danger"></i>
                                </button>
                            </>
                        )}
                        {recipe.status === 'published' && (
                            <span className="text-muted small fst-italic">Solo lectura</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCardRecipe;