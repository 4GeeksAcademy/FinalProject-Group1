// import { Link, NavLink } from "react-router-dom";
// // CORRECCIÓN: Se agrega explícitamente la extensión .jsx para resolver el problema de importación.
// import useGlobalReducer from "../hooks/useGlobalReducer.jsx";


// export const Navbar = () => {
//  const { store, dispatch } = useGlobalReducer()

// 	const logout = () => {
// 		dispatch({ type: "SET_TOKEN", payload: null })
// 		dispatch({ type: "SET_USER", payload: null })
// 		localStorage.removeItem("token")
// 		localStorage.removeItem("user")
// 	}

// 	return (
// 		<nav className="container navbar navbar-expand-lg bg-body-tertiary p-0">
// 			<div className="container-fluid">
// 				<a className="navbar-brand m-0" href="/">Food</a>
// 				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
// 					<span className="navbar-toggler-icon"></span>
// 				</button>
// 				<div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
// 					<ul className="navbar-nav me-auto mb-2 mb-lg-0 justify-content-between w-100">
// 						<li className="nav-item">
// 							<a className="nav-link active pt-3 px-3" aria-current="page" href="/">Mis recetas</a>
// 						</li>
// 						<form className="d-flex" role="search">
// 							<input className="form-control me-2 pt-0" type="search" placeholder="Search" aria-label="Search" />
// 							<button  className="btn btn-outline-success py-0" type="submit">Search</button>
// 						</form>
// 						<li>
// 							{
// 								store.token ? (
// 									<div>
// 										<button
// 											className="btn btn-outline-secondary ms-3 text-black"
// 											onClick={() => logout()}
// 										>Cerrar sesión</button>
// 									</div>
// 								) : (
// 									<div>
// 										<NavLink
// 											to={"/login"}
// 											className={"btn btn-outline-light text-black"}>
// 											Iniciar Sesión
// 										</NavLink>
// 									</div>
// 								)
// 							}
// 						</li>
// 						<li className="nav-item dropdown">
// 							<a id="Settings" className="nav-link dropdown-toggle p-0" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
// 								<span className="profile-photo-navbar bg-secondary rounded-circle">Photo</span>
// 							</a>
// 							<ul className="dropdown-menu">
// 								<li><a className="dropdown-item" href="Myprofile">My profile</a></li>
// 								<li><a className="dropdown-item" href="#">Log out</a></li>
// 							</ul>
// 						</li>
// 					</ul>
// 				</div>
// 			</div>
// 		</nav>
// 	);
// };
import { Link, NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();

	const logout = () => {
		dispatch({ type: "SET_TOKEN", payload: null });
		dispatch({ type: "SET_USER", payload: null });
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	return (
		<nav className="container navbar navbar-expand-lg bg-body-tertiary p-0">
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
							<input className="form-control me-2 pt-0" type="search" placeholder="Search" />
							<button className="btn btn-outline-success py-0" type="submit">Search</button>
						</form>

						<li className="nav-item d-flex align-items-center">

							{!store.token ? (
								<NavLink
									to={"/login"}
									className="btn btn-outline-light text-black"
								>
									Iniciar Sesión
								</NavLink>
							) : (
								<div className="dropdown ms-3">
									<a
										className="nav-link dropdown-toggle p-0"
										href="#"
										id="profileDropdown"
										role="button"
										data-bs-toggle="dropdown"
									>
										<span className="profile-photo-navbar bg-secondary rounded-circle">
											Foto
										</span>
									</a>

									<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">

										<li>
											<NavLink className="dropdown-item" to="/myprofile">
												Mi Perfil
											</NavLink>
										</li>

										<li>
											<button className="dropdown-item" onClick={logout}>
												Cerrar sesión
											</button>
										</li>

									</ul>
								</div>
							)}

						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};
