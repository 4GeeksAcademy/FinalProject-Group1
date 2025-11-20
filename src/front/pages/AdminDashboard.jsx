import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/admin_dashboard.css';


const AdminDashboard = () => {


    return (
        <div className="container p-5 bg-pinki">
            <div className="row">
                <div className="col-12 d-flex justify-content-center text-center my-3 shadow title-recipes">
                    <h1>Recetas</h1>
                </div>
                <div className="col-12 col-md-6 col-lg-4 my-5 px-5">
                    <div className="card bg-verde shadow p-3 border border-0">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW3CZJnlA3T0rimd9FQkLEhhFf-tmLyRQ1fA&s" className="card-img-top" alt="publicadas" />
                        <div className="card-body">
                            <h5 className="card-title">Publicadas</h5>
                            <p className="card-text">contador:</p>
                            <Link to={"/status/published"} className="btn btn-outline-success">entrar</Link>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4 my-5 px-5">
                    <div className="card bg-verde shadow p-3 border border-0">
                        <img src="https://thumbs.dreamstime.com/b/revisi%C3%B3n-de-archivos-listas-icono-vectores-aislados-que-se-puede-modificar-o-editar-f%C3%A1cilmente-161259836.jpg" className="card-img-top" alt="pendientes" />
                        <div className="card-body">
                            <h5 className="card-title">Pendientes</h5>
                            <p className="card-text">contador:</p>
                            <Link to={"/status/pending"} className="btn btn-outline-success">entrar</Link>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4 my-5 px-5">
                    <div className="card bg-verde shadow p-3 border border-0">
                        <img src="https://cdn-icons-png.flaticon.com/512/7933/7933285.png" className="card-img-top" alt="rechazadas" />
                        <div className="card-body">
                            <h5 className="card-title">Rechazadas</h5>
                            <p className="card-text">contador:</p>
                            <Link to={"/status/rejected"} className="btn btn-outline-success">entrar</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;