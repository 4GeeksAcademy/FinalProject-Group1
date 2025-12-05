import React, { useEffect, useState } from "react";

export const AdminReportedComments = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const URL_BASE = import.meta.env.VITE_BACKEND_URL;

    // Función para cargar los reportes
    const fetchReports = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await fetch(`${URL_BASE}/admin/reportes`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Si el backend devuelve un mensaje de texto (no hay reportes), seteamos array vacío
                if (data.message) {
                    setReports([]);
                } else {
                    setReports(data);
                }
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Error cargando reportes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Al cargar la página
    useEffect(() => {
        fetchReports();
    }, []);

    // Acción: Ocultar Comentario (Inapropiado)
    const handleHideComment = async (commentId) => {
        const token = localStorage.getItem("access_token");
        if (!confirm("¿Estás seguro de ocultar este comentario? Se marcará como inapropiado.")) return;

        try {
            const response = await fetch(`${URL_BASE}/admin/comentarios/ocultar/${commentId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Comentario ocultado correctamente.");
                fetchReports(); // Recargar la lista
            } else {
                alert("Error al ocultar el comentario.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Acción: Marcar como Revisado (Falso Positivo / No eliminar)
    const handleMarkReviewed = async (commentId) => {
        const token = localStorage.getItem("access_token");
        if (!confirm("¿Marcar reporte como revisado? El comentario permanecerá visible.")) return;

        try {
            const response = await fetch(`${URL_BASE}/admin/reportes/revisado/${commentId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Reporte cerrado. El comentario sigue visible.");
                fetchReports(); // Recargar la lista
            } else {
                alert("Error al actualizar el reporte.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (loading) return <div className="p-5 text-center">Cargando reportes...</div>;

    return (
        <div className="container my-5">
            <h2 className="mb-4">Panel de Moderación: Comentarios Reportados</h2>
            
            {reports.length === 0 ? (
                <div className="alert alert-success">No hay reportes pendientes de revisión. ¡Buen trabajo!</div>
            ) : (
                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Contenido Reportado</th>
                                <th>Razón del Reporte</th>
                                <th>Receta</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((item) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img 
                                                src={item.usuario?.image} 
                                                alt="avatar" 
                                                className="rounded-circle me-2"
                                                style={{width: "30px", height: "30px", objectFit: "cover"}}
                                            />
                                            <strong>{item.usuario?.username}</strong>
                                        </div>
                                    </td>
                                    <td className="text-danger">
                                        "{item.content}"
                                    </td>
                                    <td>
                                        {/* Mostramos las razones. Como viene un array de strings, las unimos */}
                                        {item.razones.map((r, i) => (
                                            <div key={i} className="badge bg-warning text-dark d-block mb-1 text-wrap">
                                                {r}
                                            </div>
                                        ))}
                                        <small className="text-muted">Total: {item.num_reportes_pendientes}</small>
                                    </td>
                                    <td>
                                        <a href={`/recipe/${item.receta.id}`} target="_blank" rel="noreferrer">
                                            {item.receta.title}
                                        </a>
                                    </td>
                                    <td className="text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <button 
                                                className="btn btn-success btn-sm"
                                                title="Marcar como revisado (Mantener)"
                                                onClick={() => handleMarkReviewed(item.id)}
                                            >
                                                <i className="fa-solid fa-check"></i> Ignorar
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                title="Ocultar comentario (Sancionar)"
                                                onClick={() => handleHideComment(item.id)}
                                            >
                                                <i className="fa-solid fa-eye-slash"></i> Ocultar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};