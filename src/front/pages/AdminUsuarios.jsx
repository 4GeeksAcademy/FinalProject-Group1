import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Link } from "react-router-dom";
import "../styles/create_recipe.css"


const urlBase = import.meta.env.VITE_BACKEND_URL;

const AdminUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const usersPerPage = 15;

    const token = localStorage.getItem('access_token');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${urlBase}/admin/users?page=${currentPage}&per_page=${usersPerPage}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                toast.error("Acceso denegado. Se requiere ser Administrador.");
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error("Error al cargar la lista de usuarios.");
            }

            const data = await response.json();
            setUsers(data.users);
            setTotalPages(data.total_pages);
            setCurrentPage(data.current_page);

        } catch (error) {
            console.error("Detaisl:", error);
            toast.error("Error al cargar datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);


    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`¿Estás seguro de cambiar el rol del usuario a "${newRole}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${urlBase}/admin/user/role/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ rol: newRole }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Rol actualizado exitosamente");
                fetchUsers();
            } else {
                toast.error("Error al cambiar el rol.");
            }
        } catch (error) {
            toast.error("Error de red al intentar cambiar el rol.");
        }
    };

    const handleChangeActive = async (userId, currentStatus) => {
        const action = currentStatus ? "inhabilitar" : "habilitar";
        if (!window.confirm(`¿Estás seguro de ${action} a este usuario?`)) {
            return;
        }

        try {
            const response = await fetch(`${urlBase}/admin/user/change-active/${userId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("se cambió el estatus del usuario");
                fetchUsers();
            } else {
                toast.error("Error al cambiar el estatus.");
            }
        } catch (error) {
            toast.error("Error de red al intentar cambiar el estatus.");
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`¡PELIGRO! ¿Estás ABSOLUTAMENTE seguro de eliminar al usuario ${username}? Esta acción es irreversible.`)) {
            return;
        }

        try {
            const response = await fetch(`${urlBase}/admin/user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Eliminado exitosamente");
                fetchUsers();
            } else {
                toast.error("Error al eliminar usuario.");
            }
        } catch (error) {
            toast.error("Error de red al intentar eliminar el usuario.");
        }
    };


    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Cargando...</span>
                </div>
                <p>Cargando datos de usuarios...</p>
            </div>
        );
    }

    if (users.length === 0 && !loading) {
        return (<div className="container my-5 text-center text-danger">No se encontraron usuarios</div>);
    }

    return (
        <div className="container bg-fondo my-5">
            <Toaster position="top-center" richColors />

            <h2 className="text-center bg-titulo p-3 mb-4">Panel de Administración de los Usuarios registrados</h2>

            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Fullname</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estatus</th>
                            <th>Fecha-Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users
                            .filter(user => user != null)
                            .map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.fullname || 'S/I'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select
                                            className={`form-select ${user.rol === "admin" ? "bg-warning text-dark" : "bg-light"}`}
                                            value={user.rol}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="usuario">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${user.is_Active ? 'bg-success' : 'bg-danger'}`}
                                        >
                                            {user.is_Active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                className={`btn btn-sm ${user.is_Active ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => handleChangeActive(user.id, user.is_Active)}
                                                title={user.is_Active ? "Inhabilitar" : "Habilitar"}
                                            >
                                                <i className={`fa-solid ${user.is_Active ? "fa-user-slash" : "fa-user-check"}`}></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                title="Eliminar"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                            <li
                                key={index + 1}
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
            {users.length === 0 && !loading && (
                <div className="alert alert-info text-center mt-4">
                    No se encontraron usuarios.
                </div>
            )}
        </div>
    );
};

export default AdminUsuarios;