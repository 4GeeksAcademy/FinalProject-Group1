import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../styles/admin_dashboard.css';


const urlBase = import.meta.env.VITE_BACKEND_URL;

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        published: '...',
        pending: '...',
        rejected: '...'
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecipeCounts = async () => {
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`${urlBase}/admin/recipes/counts`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            setCounts(data.counts);

        } catch (error) {
            console.error("Error al cargar los conteos:", error);
            setCounts({ published: 'Error', pending: 'Error', rejected: 'Error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipeCounts();
    }, []);


    return (
        <div className="container p-5 bg-pinki">
            <div className="row d-flex justify-content-center text-center">
                <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center text-center my-3 shadow title-recipes">
                    <h1>Recetas</h1>
                </div>
            </div>
            <div className="row d-flex justify-content-center text-center">
                <div className="col-12 col-md-6 col-lg-3 my-5 px-5">
                    <Link to={"/status/published"} className="card-link">
                        <div className="card bg-verde p-3 border border-0 card-efect">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW3CZJnlA3T0rimd9FQkLEhhFf-tmLyRQ1fA&s" className="card-img-top" alt="publicadas" />
                            <div className="card-body">
                                <h5 className="card-title">Publicadas</h5>
                                <p className='fs-2 text m-0'><b>{counts.published}</b></p>
                                <p className='m-0'>recetas</p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-12 col-md-6 col-lg-3 my-5 px-5">
                    <Link to={"/status/pending"} className="card-link">
                        <div className="card bg-verde p-3 border border-0 card-efect">
                            <img src="https://thumbs.dreamstime.com/b/revisi%C3%B3n-de-archivos-listas-icono-vectores-aislados-que-se-puede-modificar-o-editar-f%C3%A1cilmente-161259836.jpg" className="card-img-top" alt="pendientes" />
                            <div className="card-body">
                                <h5 className="card-title">Pendientes</h5>
                                <p className='fs-2 text m-0'><b>{counts.pending}</b></p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-12 col-md-6 col-lg-3 my-5 px-5 ">
                    <Link to={"/status/rejected"} className="card-link">
                        <div className="card bg-verde p-3 border border-0 card-efect">
                            <img src="https://cdn-icons-png.flaticon.com/512/7933/7933285.png" className="card-img-top" alt="rechazadas" />
                            <div className="card-body">
                                <h5 className="card-title">Rechazadas</h5>
                                <p><span className='fs-2 text'><b>{counts.rejected}</b></span> recetas </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div >
    )
}

export default AdminDashboard;