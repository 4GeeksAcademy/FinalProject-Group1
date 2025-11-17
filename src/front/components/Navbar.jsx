import { Link } from "react-router-dom";
// CORRECCIÓN: Se agrega explícitamente la extensión .jsx para resolver el problema de importación.
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
    const { store, actions } = useGlobalReducer();

    const handleLogout = () => {
        localStorage.removeItem("access_token"); 
        actions.clearAuthData();
        console.log("User logged out");
    };

    return (
        <nav className="container navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Food</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 justify-content-between w-100">

                        <li className="nav-item">
                            <form className="d-flex" role="search">
                                <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                                <button className="btn btn-outline-success" type="submit">Search</button>
                            </form>
                        </li>

                        {store.token ? (
                            // Elementos visibles si el usuario está logueado
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link active" aria-current="page" to="/mis-recetas">Mis recetas</Link>
                                </li>
                                <li className="nav-item dropdown">
                                    <a id="Settings" className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Settings
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><Link className="dropdown-item" to="/Myprofile">My profile</Link></li>
                                        <li><button className="dropdown-item" onClick={handleLogout}>Log out</button></li> 
                                    </ul>
                                </li>
                                <li className="nav-item"> 
                                    <button className="btn btn-danger" onClick={handleLogout}>
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            // Elementos visibles si el usuario NO está logueado
                            <li className="nav-item login">
                                <Link className="nav-link active btn btn-primary text-white" to="/login">
                                    Ingresar
                                </Link>
                            </li>
                        )}
                        
                    </ul>
                </div>
            </div>
        </nav>
    );
};