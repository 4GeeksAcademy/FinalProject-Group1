import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";


export const Myprofile = () => {

    const urlBase = import.meta.env.VITE_BACKEND_URL;

    const { store, dispatch } = useGlobalReducer()

    const [user, setUser] = useState({
        image: "",
        username: "",
        fullname: "",
        email: ""
    });



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

    const handleSavePassword = () => {
        if (passwordData.newPass !== passwordData.repeatNew) {
            setError("Las contraseñas no coinciden");
            return;
        }


        console.log("Guardando contraseña:", passwordData);

        setError("");
        setPasswordData({ current: "", newPass: "", repeatNew: "" });
        setShowPasswordModal(false);
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/users/${store.currentUserId}`);

                if (!response.ok) throw new Error("Error loading user");

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error cargando el usuario:", error);
            }
        };

        loadUser();
    }, []);


    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="row align-columns mt-5">
                        <div className="div col-4 border">
                            <div>
                                <h2>My Profile</h2>
                            </div>
                            <button className="btn btn-sm btn-warning w-100 my-2">Profile Details</button>
                        </div>

                        <div className="div col-8 border">
                            <div>
                                <h2>Profile Details</h2>
                            </div>


                            <div className="form-control d-flex align-items-center">
                                <img src={user.image || "imagen random"} alt="Profile" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control mx2"
                                ></input>
                            </div>


                            <div className="form-control">
                                <label>Full Name</label>
                                {editing.fullname ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            className="form-control mx-2"
                                            type="text"
                                            value={user.fullname}
                                            onChange={(event) => {
                                                setUser({ ...user, fullname: event.target.value });
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    setEditing({ ...editing, fullname: false });
                                                }
                                            }}
                                            placeholder="Full Name"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => setEditing({ ...editing, fullname: false })}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <div className="form-control mx-2 mb-0" type="text">
                                            {user.fullname || <div>Full Name</div>}
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditing({ ...editing, fullname: true })}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>


                            <div className="form-control">
                                <label>User Name</label>
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
                                            placeholder="User Name"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => setEditing({ ...editing, username: false })}
                                        >
                                            Save
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
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-control">
                                <label>Email</label>
                                {editing.email ? (
                                    <div className="d-flex align-items-center flex-wrap">
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
                                            placeholder="Email"
                                            autoFocus
                                        />
                                        <button
                                            className="btn btn-success btn-sm mb-2"
                                            onClick={async () => {
                                                setEditing({ ...editing, email: false });
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center flex-wrap">
                                        <input
                                            readOnly
                                            className="form-control mx-2 mb-0 flex-grow-1"
                                            type="email"
                                            value={user.email || ""}
                                            placeholder="Email"
                                        />
                                        <button
                                            className="btn btn-secondary btn-sm mb-0"
                                            onClick={() => setEditing({ ...editing, email: true })}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-control">
                                <label>Password</label>
                                <input className="mx-2" type="password" placeholder="Password" disabled />
                                <button
                                    className="btn btn-sm btn-secondary mx-2"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Edit
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
                                <h5 className="modal-title">Change Password</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPasswordModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Current Password</label>
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
                                    <label>New Password</label>
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
                                    <label>Repeat New Password</label>
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
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSavePassword}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
