import { Link, NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import useTheme from '../hooks/useTheme.jsx';
import "../styles/navbar.css"

// AHORA USA EXPORTACIÓN NOMBRADA para coincidir con import { Navbar } de Layout.jsx
export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const { theme, toggleTheme } = useTheme();

    const logout = () => {
        dispatch({ type: "SET_TOKEN", payload: null })
        dispatch({ type: "SET_USER", payload: null })
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
    }


    const navbarThemeClass = theme === 'dark' ? 'bg-dark navbar-dark' : 'bg-body-tertiary';
    const icon = theme === 'light' ? '🌙' : '☀️';
    const buttonLabel = theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    const buttonTextClass = theme === 'dark' ? 'text-white' : 'text-black';
    
    const userRole = store.user ? store.user.rol : null;
    const isAdmin = userRole === "admin";

    return (
        <nav className={`navbar navbar-expand-lg p-0 w-100 ${navbarThemeClass}`} data-bs-theme={theme}>
            <div className="container-fluid">
                <Link className="navbar-brand m-0" to="/">Food</Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 justify-content-between w-100">

                        {store.token && (
                            <li className="nav-item">
                                <NavLink className="nav-link active pt-3 px-3" to="/">
                                    Mis recetas
                                </NavLink>
                            </li>
                        )}
                        <form className="d-flex" role="search">
                            <input className={`form-control me-2 pt-0 ${theme === 'dark' ? 'form-control-dark' : ''}`} type="search" placeholder="Search" />
                            <button className="btn btn-outline-success py-0" type="submit">Search</button>
                        </form>
                        
                        {isAdmin && (
                            <div className="d-flex">
                                <li className="menus me-4 mt-2">
                                    <a href="#">Gestionar</a>
                                    <ul className="sub-menu sin-estilo">
                                        <li className="py-2"><Link to={"/status"} ><span>Recetas</span></Link></li>
                                        <li className="py-2"><Link to={"/administrar/users"}><span>Usuarios</span></Link></li>
                                    </ul>
                                </li>
                                <li className="menus me-4 mt-2">
                                    <a href="#">Crear</a>
                                    <ul className="sub-menu sin-estilo">
                                        <li className="py-2"><Link to={"/recipes/create"}><span>Receta</span></Link></li>
                                        <li className="py-2"><Link to={"/admin/categories"}><span>Categorías</span></Link></li>
                                    </ul>
                                </li>
                            </div>
                        )}
                            <li className="nav-item d-flex align-items-center me-2">
                                        <button
                                            className={`btn btn-outline-secondary py-1 px-3 ${buttonTextClass} theme-toggle-button`}
                                            onClick={toggleTheme}
                                            aria-label={buttonLabel}
                                        >
                                            {icon}
                                        </button>
                                    </li>

                        <li className="nav-item d-flex align-items-center">
                            {!store.token ? (
                                <NavLink
                                    to={"/login"}
                                    className={`btn btn-outline-light ${buttonTextClass}`}
                                >
                                    Iniciar Sesión
                                </NavLink>
                            ) : (
                                <>                                  
                                    <div className="dropdown ms-3">
                                        <a
                                            className="nav-link dropdown-toggle p-0"
                                            href="#"
                                            id="profileDropdown"
                                            role="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            <img
                                                src={store.user?.image || `https://ui-avatars.com/api/?name=${store.user?.fullname || "User"}&background=random`}
                                                alt="profile"
                                                className="rounded-circle"
                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                            />
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                            <li>
                                                <NavLink className="dropdown-item" to="/myprofile">Mi Perfil</NavLink>
                                            </li>
                                            {!isAdmin && (
                                                <>
                                                    <li><NavLink className="dropdown-item" to="/recipes/create">Sugerir receta</NavLink></li>
                                                    <li><NavLink className="dropdown-item" to="/user/status">Status</NavLink></li>
                                                </>
                                            )}
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item" onClick={logout}>
                                                    Cerrar sesión
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav >
    );
};
export default Navbar