import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import '../styles/admin_dashboard.css';


const urlBase = import.meta.env.VITE_BACKEND_URL;

const AdminDashboard = () => {
    const [counts, setCounts] = useState({
        published: '...',
        pending: '...',
        rejected: '...'
    });
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef(null);

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

        const startPolling = () => {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    fetchRecipeCounts();
                    console.log("Actualizando datos...");
                }, 15000);
            }
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                fetchRecipeCounts();
                startPolling();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        startPolling();

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);


    return (
        <div className="container p-5 bg-pinki vh-100">
            <div className="row d-flex justify-content-center text-center">
                <div className="col-12 col-md-6 col-lg-3 d-flex justify-content-center text-center my-3 shadow title-recipes">
                    <h1>Recetas</h1>
                </div>
            </div>
            <div className="row d-flex justify-content-center text-center">
                <div className="row d-flex justify-content-center text-center">

                    <div className="col-12 col-md-6 col-lg-3 my-4 px-4">
                        <Link to={"/status/published"} className="card-link">
                            <div className="card card-admin-custom status-published shadow-sm p-3 border-0 card-efect">
                                <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" className="card-img-top icon-dashboard" alt="publicadas" />
                                <div className="card-body">
                                    <h5 className="fw-bold">Publicadas</h5>
                                    <p className='fs-2 text-success m-0'><b>{counts.published}</b></p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3 my-4 px-4">
                        <Link to={"/status/pending"} className="card-link">
                            <div className="card card-admin-custom status-pending shadow-sm p-3 border-0 card-efect">
                                <img src="https://cdn-icons-png.flaticon.com/512/942/942748.png" className="card-img-top icon-dashboard" alt="pendientes" />
                                <div className="card-body">
                                    <h5 className="fw-bold">Pendientes</h5>
                                    <p className='fs-2 text-warning m-0'><b>{counts.pending}</b></p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3 my-4 px-4">
                        <Link to={"/status/rejected"} className="card-link">
                            <div className="card card-admin-custom status-rejected shadow-sm p-3 border-0 card-efect">
                                <img src="https://cdn-icons-png.flaticon.com/512/564/564619.png" className="card-img-top icon-dashboard" alt="rechazadas" />
                                <div className="card-body">
                                    <h5 className="fw-bold">Rechazadas</h5>
                                    <p className='fs-2 text-danger m-0'><b>{counts.rejected}</b></p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AdminDashboard;