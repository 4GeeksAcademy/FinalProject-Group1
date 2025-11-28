import { useEffect, useState } from "react";

const Comment = ({ recipeId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    const URL_BASE = import.meta.env.VITE_BACKEND_URL;

    const getUserIdFromToken = () => {
        const token = localStorage.getItem("access_token");
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return Number(payload.sub || payload.user_id);
        } catch {
            return null;
        }
    };

    const currentUserId = getUserIdFromToken();

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = [
            { label: "año", seconds: 31536000 },
            { label: "mes", seconds: 2592000 },
            { label: "día", seconds: 86400 },
            { label: "hora", seconds: 3600 },
            { label: "minuto", seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `hace ${count} ${interval.label}${count > 1 ? "s" : ""}`;
            }
        }
        return "hace unos segundos";
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`${URL_BASE}/recipes/${recipeId}/comments`);
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.log("Error cargando comentarios", error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [recipeId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem("access_token");
        if (!token) return alert("Debes iniciar sesión");

        try {
            await fetch(`${URL_BASE}/recipes/${recipeId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Error enviando comentario:", error);
        }
    };

    const deleteComment = async (id) => {
        const token = localStorage.getItem("access_token");
        if (!token) return alert("Debes iniciar sesión");

        try {
            await fetch(`${URL_BASE}/comments/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            setComments((prev) => prev.filter((comment) => comment.id !== id));
        } catch (error) {
            console.error("Error eliminando comentario:", error);
        }
    };

    const handleEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const handleUpdate = async (id) => {
        const token = localStorage.getItem("access_token");
        if (!token) return alert("Debes iniciar sesión");

        try {
            await fetch(`${URL_BASE}/comments/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editingContent }),
            });

            setEditingCommentId(null);
            setEditingContent("");
            fetchComments();
        } catch (error) {
            console.error("Error editando comentario:", error);
        }
    };

    return (
        <div className="form-control">
            <h2>Comentarios</h2>
            <form onSubmit={handleSubmit} className="form-control d-flex justify-content-between">
                <input
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-100 border border-none form-control"
                />
                <button className="btn btn-primary" type="submit">Enviar</button>
            </form>

            <div className="form-control">
                {comments.length === 0 ? (
                    <p>Sé el primero en comentar!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="form-control border-0 py-3">
                            <div className="d-flex gap-3">
                                <img
                                    src={comment.user.image}
                                    alt={comment.user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />


                                <div className="w-100">

                                    <div className="d-flex align-items-center gap-2">
                                        <strong>{comment.user?.username || "Usuario"}</strong>
                                        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                            {timeAgo(comment.created_at)}
                                        </span>
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="d-flex mt-2 gap-2">
                                            <input
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                className="form-control"
                                            />
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleUpdate(comment.id)}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setEditingCommentId(null)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="mt-1">{comment.content}</p>
                                    )}
                                    {(Number(currentUserId) === Number(comment.user?.id ?? comment.user_id)) &&
                                        editingCommentId !== comment.id && (
                                            <div className="d-flex gap-2 mt-1">
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => handleEdit(comment)}
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => deleteComment(comment.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comment;
