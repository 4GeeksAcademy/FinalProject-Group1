import { Link, NavLink } from "react-router-dom";
// CORRECCIÓN: Se agrega explícitamente la extensión .jsx para resolver el problema de importación.
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../styles/navbar.css"


export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer()

	const logout = () => {
		dispatch({ type: "SET_TOKEN", payload: null })
		dispatch({ type: "SET_USER", payload: null })
		localStorage.removeItem("access_token")
		localStorage.removeItem("user")
	}

	const userRole = store.user ? store.user.rol : null;
	const isAdmin = userRole === "admin";

	return (
		<nav className="container navbar navbar-expand-lg bg-body-tertiary p-0">
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
							<input className="form-control me-2 pt-0" type="search" placeholder="Search" aria-label="Search" />
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
											className={"btn btn-outline-light text-black"}>
											Iniciar Sesión
										</NavLink>
									</div>
								)
							}
						</li>
						<div>
							{
								isAdmin ? (
									<div>

										<li className="menus me-4 mt-2">
											<a href="#">Gestionar</a>
											<ul className="sub-menu sin-estilo">
												<li className="py-2"><Link to={"/status"} ><span>Recetas</span></Link></li>
												<li className="py-2"><Link to={"/admin/categories"}><span>Categorías</span></Link></li>
											</ul>
										</li>
										<li className="menus me-4 mt-2">
											<a href="#">Crear</a>
											<ul className="sub-menu sin-estilo">
												<li className="py-2"><Link to={"/recipes/create"}><span>Receta</span></Link></li>
												<li className="py-2"><span>Administrador</span></li>
											</ul>
										</li>
									</div>
								) : null
							}
						</div>
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