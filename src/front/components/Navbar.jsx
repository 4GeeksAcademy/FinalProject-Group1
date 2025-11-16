import { Link, NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer()

	const logout = () => {
		dispatch({ type: "SET_TOKEN", payload: null })
		dispatch({ type: "SET_USER", payload: null })
		localStorage.removeItem("token")
		localStorage.removeItem("user")
	}

	return (
		<nav className="container navbar navbar-expand-lg bg-body-tertiary">
			<div className="container-fluid">
				<a className="navbar-brand" href="/">Food</a>
				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					<ul className="navbar-nav me-auto mb-2 mb-lg-0 justify-content-between w-100">
						<li className="nav-item">
							<a className="nav-link active" aria-current="page" href="/">Mis recetas</a>
						</li>
						<form className="d-flex" role="search">
							<input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
							<button className="btn btn-outline-success" type="submit">Search</button>
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
						<li className="nav-item dropdown">
							<a id="Settings" className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								Settings
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