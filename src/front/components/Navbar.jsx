import { Link, NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import useTheme from '../hooks/useTheme.jsx'; 

const Navbar = () => {
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

    return (
        <nav className={`container navbar navbar-expand-lg p-0 ${navbarThemeClass}`} data-bs-theme={theme}>
            <div className="container-fluid">
                <a className="navbar-brand m-0" href="/">Food</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 justify-content-between w-100">
                        <li className="nav-item">
                            <a className="nav-link active pt-3 px-3" aria-current="page" href="/">Mis recetas</a>
                        </li>
                        <form className="d-flex" role="search">
                            <input className={`form-control me-2 pt-0 ${theme === 'dark' ? 'form-control-dark' : ''}`} type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success py-0" type="submit">Search</button>
                        </form>
                        
                        <li>
                            {
                                store.token ? (
                                    <div>
                                        <button
                                            className="btn btn-outline-secondary ms-3 text-black"
                                            onClick={() => logout()}
                                        >Cerrar sesión</button>
                                    </div>
                                ) : (
                                    <div>
                                        <NavLink
                                            to={"/login"}
                                            className={`btn btn-outline-light ${buttonTextClass}`}>
                                            Iniciar Sesión
                                        </NavLink>
                                    </div>
                                )
                            }
                        </li>
                        
                        <li className="nav-item d-flex align-items-center">
                            <button
                                className={`btn btn-outline-secondary py-1 px-3 ${buttonTextClass} theme-toggle-button`}
                                onClick={toggleTheme}
                                aria-label={buttonLabel}
                            >
                                {icon}
                            </button>
                        </li>
                        
                        <li className="nav-item dropdown">
                            <a id="Settings" className="nav-link dropdown-toggle p-0" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <span className="profile-photo-navbar bg-secondary rounded-circle">Photo</span>
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="Myprofile">My profile</a></li>
                                <li><a className="dropdown-item" href="#">Log out</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;