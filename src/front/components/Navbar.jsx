import { Link, NavLink, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import useTheme from '../hooks/useTheme.jsx';
import "../styles/navbar.css"

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const logout = () => {
        dispatch({ type: "SET_TOKEN", payload: null });
        dispatch({ type: "SET_USER", payload: null });
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const navbarThemeClass = theme === 'dark' ? 'bg-dark navbar-dark' : 'bg-body-tertiary';
    const icon = theme === 'light' ? '🌙' : '☀️';
    const buttonLabel = theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    const buttonTextClass = theme === 'dark' ? 'text-white' : 'text-black';

    const userRole = store.user ? store.user.rol : null;
    const isAdmin = userRole === "admin";

    return (
        <nav className={`navbar navbar-expand-lg p-0 w-100 ${navbarThemeClass}`} data-bs-theme={theme}>
            <div className="container-fluid">
                <div className="d-flex align-items-center">
                    <div className="brand-group">
                        <Link className="navbar-brand m-0" to="/">Saborify</Link>

                        {store.token && (
                            <NavLink className="nav-link brand-link" to="/">
                                Mis recetas
                            </NavLink>
                        )}
                    </div>
                </div>


                {/* CENTRO: Gestionar / Crear (solo admin) */}
                {isAdmin && (
                    <div className="d-flex align-items-center justify-content-center flex-grow-1">
                        <div className="menus me-4 mt-2">
                            <a href="#">Gestionar</a>
                            <ul className="sub-menu sin-estilo">
                                <li className="py-2">
                                    <Link to={"/status"}>
                                        <span>Recetas</span>
                                    </Link>
                                </li>
                                <li className="py-2">
                                    <Link to={"/administrar/users"}>
                                        <span>Usuarios</span>
                                    </Link>
                                </li>
                                {/* --- NUEVO BOTÓN REPORTES --- */}
                                <li className="py-2">
                                    <Link to={"/admin/reportes"}>
                                        <span>Reportes</span>
                                    </Link>
                                </li>
                                {/* --------------------------- */}
                            </ul>
                        </div>

                        <div className="menus me-4 mt-2">
                            <a href="#">Crear</a>
                            <ul className="sub-menu sin-estilo">
                                <li className="py-2">
                                    <Link to={"/recipes/create"}>
                                        <span>Receta</span>
                                    </Link>
                                </li>
                                <li className="py-2">
                                    <Link to={"/admin/categories"}>
                                        <span>Categorías</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* DERECHA: modo, favoritos, perfil */}
                <div className="d-flex align-items-center ms-auto">
                    {/* BOTÓN MODO OSCURO */}
                    <button
                        className={`btn btn-outline-secondary py-1 px-3 ${buttonTextClass} theme-toggle-button me-2`}
                        onClick={toggleTheme}
                        aria-label={buttonLabel}
                    >
                        {icon}
                    </button>

                    {/* FAVORITOS */}
                    {store.token && (
                        <NavLink
                            to="/favoritos"
                            className="favorites-btn me-2"
                            aria-label="Ver favoritos"
                        >
                            <i className="fa-solid fa-heart"></i>
                        </NavLink>
                    )}

                    {/* PERFIL / LOGIN */}
                    {!store.token ? (
                        <NavLink
                            to={"/login"}
                            className={`btn btn-outline-light ${buttonTextClass}`}
                        >
                            Iniciar Sesión
                        </NavLink>
                    ) : (
                        <div className="dropdown ms-2">
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
                                        <li>
                                            <NavLink className="dropdown-item" to="/recipes/create">
                                                Sugerir receta
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink className="dropdown-item" to="/user/status">
                                                Status
                                            </NavLink>
                                        </li>
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
                    )}
                </div>
            </div>
            {/* FIN LAYOUT */}
        </nav >
    );
};

export default Navbar;