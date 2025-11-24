import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import storeReducer from "../store.js";
import { Navigate } from "react-router-dom";


export const Myprofile = () => {

    const urlBase = import.meta.env.VITE_BACKEND_URL;

    const { store, dispatch } = useGlobalReducer()
    if (!store.token || !store.user) {
        return <Navigate to="/login" replace />;
    }

    const [user, setUser] = useState({
        profile: "",
        username: "",
        fullname: "",
        email: ""
    });

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${urlBase}/upload-profile-image`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + store.token
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            setUser({ ...user, profile: data.image });
            dispatch({ type: "SET_USER", payload: data.user });
            localStorage.setItem("user", JSON.stringify(data.user));
        } else {
            console.error("Error al subir imagen:", data.message);
        }
    };


    const [editing, setEditing] = useState({
        image: false,
        username: false,
        fullname: false,
        email: false,
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: "",
        newPass: "",
        repeatNew: ""
    });
    const [error, setError] = useState("");

    const handleSavePassword = async () => {

        if (!passwordData.current || !passwordData.newPass || !passwordData.repeatNew) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        if (passwordData.newPass !== passwordData.repeatNew) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        if (passwordData.current === passwordData.newPass) {
            setError("La nueva contraseña debe ser distinta a la actual.");
            return;
        }

        const response = await fetch(`${urlBase}/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + store.token
            },
            body: JSON.stringify({
                current_password: passwordData.current,
                new_password: passwordData.newPass
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.msg || "Error al cambiar contraseña");
            return;
        }

        dispatch({ type: "SET_TOKEN", payload: data.token });
        dispatch({ type: "SET_USER", payload: data.user });

        localStorage.setItem("access_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setShowPasswordModal(false);
        setPasswordData({ current: "", newPass: "", repeatNew: "" });
    };


    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await fetch(`${urlBase}/user/${store.user.id}`, {
                    method: 'GET',
                    headers: {
                        "Authorization": "Bearer " + store.token

                    },
                })
                const data = await response.json();
                setUser({
                    profile: data.image,      
                    username: data.username,
                    fullname: data.fullname,
                    email: data.email
                });
            } catch (error) {
                console.error("Error cargando el usuario:", error);
            }
        };

        loadUser();
    }, []);

    const updateUser = async () => {
        try {
            const response = await fetch(`${urlBase}/user/${store.user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + store.token
                },
                body: JSON.stringify({
                    fullname: user.fullname,
                    username: user.username,
                    email: user.email,
                    profile: user.profile
                })
            });

            const data = await response.json();
            console.log("Usuario actualizado:", data);

            if (response.ok) {
                setUser(data);
                dispatch({ type: "SET_USER", payload: data.user });
                localStorage.setItem("user", JSON.stringify(data.user));
                return data.user;
            }


        } catch (error) {
            console.error("Error actualizando usuario:", error);
        }
    };


    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="row align-columns mt-5">
                        <div className="div col-4 border">
                            <div>
                                <h2>Mi perfil</h2>
                            </div>
                            <button className="btn btn-sm btn-warning w-100 my-2">Detalles</button>
                        </div>

                        <div className="div col-8 border">
                            <div>
                                <h2>Detalles de mi perfil</h2>
                            </div>


                            <div className="form-control d-flex align-items-center">
                                <img
                                    src={user.profile || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullname || "User")}
                                    alt="Profile"
                                    className="rounded-circle"
                                    width={80}
                                />


                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control mx2"
                                    onChange={handleImageUpload}
                                ></input>
                            </div>


                            <div className="form-control">
                                <label>Nombre Completo</label>
                                {editing.fullname ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            className="form-control mx-2"
                                            type="text"
                                            value={user.fullname}
                                            onChange={(event) => {
                                                setUser({ ...user, fullname: event.target.value });
                                            }}
                                            onKeyDown={async (event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    setEditing({ ...editing, fullname: false });
                                                }
                                            }}
                                            placeholder="Nombre Completo"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={async () => {
                                                const updated = await updateUser();
                                                if (updated) {
                                                    setUser(updated);
                                                }
                                                setEditing({ ...editing, fullname: false });
                                            }}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <div className="form-control mx-2 mb-0" type="text">
                                            {user.fullname || <div>Nombre Completo</div>}
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditing({ ...editing, fullname: true })}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                )}
                            </div>


                            <div className="form-control">
                                <label>Nombre de Usuario</label>
                                {editing.username ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            className="form-control mx-2"
                                            type="text"
                                            value={user.username}
                                            onChange={(event) => {
                                                setUser({ ...user, username: event.target.value });
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    setEditing({ ...editing, username: false });
                                                }
                                            }}
                                            placeholder="Nombre de Usuario"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={async () => {
                                                const updated = await updateUser();
                                                if (updated) {
                                                    setUser(updated);
                                                }
                                                setEditing({ ...editing, username: false })

                                            }}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <div className="form-control mx-2 mb-0" type="text">
                                            {user.username || <div>User Name</div>}
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditing({ ...editing, username: true })}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-control">
                                <label>Correo</label>
                                {editing.email ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            className="form-control mx-2 mb-2 flex-grow-1"
                                            type="email"
                                            value={user.email}
                                            onChange={(event) => setUser({ ...user, email: event.target.value })}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    setEditing({ ...editing, email: false });
                                                }
                                            }}
                                            placeholder="Correo"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm mb-2"
                                            onClick={async () => {
                                                const updated = await updateUser();
                                                if (updated) {
                                                    setUser(updated);
                                                }
                                                setEditing({ ...editing, email: false })

                                            }}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <input
                                            readOnly
                                            className="form-control mx-2 mb-0 flex-grow-1"
                                            type="email"
                                            value={user.email || "Email"}
                                        />
                                        <button
                                            className="btn btn-secondary btn-sm mb-0"
                                            onClick={() => setEditing({ ...editing, email: true })}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-control">
                                <label>Contraseña</label>
                                <input className="mx-2" type="password" placeholder="*********" disabled />
                                <button
                                    className="btn btn-sm btn-secondary mx-2"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {showPasswordModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cambiar Contraseña</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPasswordModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordData.current}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, current: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordData.newPass}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, newPass: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Repetir Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordData.repeatNew}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, repeatNew: e.target.value })
                                        }
                                    />
                                </div>
                                {error && <div className="text-danger">{error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleSavePassword}>
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
