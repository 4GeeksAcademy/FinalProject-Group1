import { useEffect, useState } from "react";

const Comment = ({ recipeId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const URL_BASE = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchComments();
    }, [recipeId]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`${URL_BASE}/recipes/${recipeId}/comments`);
            const data = await response.json();
            setComments(data);                           
        } catch (error) {
            console.log("Error cargando comentarios", error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!newComment.trim()) return;

        try {
            await fetch(`${URL_BASE}/recipes/${recipeId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Error enviando comentario:", Error);
        }
    };

    const deleteComment = async (id) => {
        try {
            await fetch(`${URL_BASE}/comments/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            setComments(prev => prev.filter(comment => comment.id !== id));
        } catch (error) {
            console.error("Error eliminando comentario:", error);
        }
    };

    return (
        <div className="comment-section">
            <h2>Comentarios</h2>

            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                />
                <button type="submit">Enviar</button>
            </form>

            <ul className="comment-list">
                {comments.length === 0 ? (
                    <p className="text-muted">Sé el primero en comentar!</p>
                ) : (
                    comments.map(comment => (
                        <li key={comment.id} className="comment-item">
                            <div>
                                <strong>{comment.user?.username || "Usuario"}</strong>
                                <p>{comment.content}</p>
                            </div>

                            <button
                                onClick={() => deleteComment(comment.id)}
                                className="btn-delete"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Comment;
