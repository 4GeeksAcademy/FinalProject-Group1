import { Link } from "react-router-dom";

export const Navbar = () => {

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
							<button  className="btn btn-outline-success" type="submit">Search</button>
						</form>
						<li className="nav-item dropdown">
							<a id="Settings" className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								Settings
							</a>
							<ul className="dropdown-menu">
								<li><a className="dropdown-item" href="Myprofile">My profile</a></li>
								<li><a className="dropdown-item" href="#">Log out</a></li>
							</ul>
						</li>
						<li className="d-flex nav-item">
							<div className="bg-secondary rounded-circle pt-1" style={{ width: "40px", height: "40px" }}>
								Foto
							</div>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};