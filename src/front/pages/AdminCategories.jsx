import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [feedback, setFeedback] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const { store } = useGlobalReducer();

  const getToken = () =>
    store?.token ||
    store?.user?.token ||
    localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/categories`);
      if (!response.ok) {
        throw new Error("Error fetching categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setFeedback(null);

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setFeedback({
        type: "error",
        text: "El nombre de la categoría es obligatorio.",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      setFeedback({
        type: "error",
        text: "Debes iniciar sesión como admin para crear categorías.",
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name_category: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la categoría");
      }

      setFeedback({
        type: "success",
        text: data.message || "Categoría creada correctamente.",
      });

      setNewCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: err.message });
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name_category);
    setFeedback(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdateCategory = async (event) => {
    event.preventDefault();
    setFeedback(null);

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setFeedback({
        type: "error",
        text: "El nombre de la categoría no puede estar vacío.",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      setFeedback({
        type: "error",
        text: "Debes iniciar sesión como admin para editar categorías.",
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/categories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name_category: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar la categoría");
      }

      setFeedback({
        type: "success",
        text: data.message || "Categoría actualizada correctamente.",
      });

      setEditingId(null);
      setEditName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: err.message });
    }
  };

  const handleDeleteCategory = async (id) => {
    setFeedback(null);

    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    const token = getToken();
    if (!token) {
      setFeedback({
        type: "error",
        text: "Debes iniciar sesión como admin para eliminar categorías.",
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar la categoría");
      }

      setFeedback({
        type: "success",
        text: data.message || "Categoría eliminada correctamente.",
      });

      fetchCategories();
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: err.message });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="admin-categories-page py-4">
      <div className="container">
        <div className="admin-card shadow-sm">
          <div className="admin-card__header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <span className="admin-pill">Admin panel</span>
              <h1 className="admin-title mt-3 mb-1">Gestión de categorías</h1>
              <p className="admin-subtitle mb-0">
                Crea, edita y organiza las categorías de tus recetas para que los usuarios puedan navegar mejor.
              </p>
            </div>
            <div className="mt-3 mt-md-0 text-md-end">
              <p className="admin-meta mb-1">
                Categorías activas:{" "}
                <span className="admin-meta__number">{categories.length}</span>
              </p>
              {loading && <span className="admin-tag">Actualizando...</span>}
            </div>
          </div>

          {feedback && (
            <div
              className={`admin-alert mt-3 ${
                feedback.type === "success" ? "admin-alert--success" : "admin-alert--error"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="row mt-4">
            <div className="col-12 col-md-5 mb-4 mb-md-0">
              <div className="admin-section">
                <h2 className="admin-section__title">Nueva categoría</h2>
                <p className="admin-section__subtitle">
                  Agrega categorías para organizar tus recetas por tipo, ocasión o estilo.
                </p>

                <form className="d-flex flex-column gap-2" onSubmit={handleCreateCategory}>
                  <input
                    type="text"
                    className="form-control admin-input"
                    placeholder="Ej: Desayunos, Postres, Vegano…"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button type="submit" className="btn admin-btn-primary mt-1">
                    Crear categoría
                  </button>
                </form>
              </div>
            </div>

            <div className="col-12 col-md-7">
              <div className="admin-section">
                <h2 className="admin-section__title d-flex justify-content-between align-items-center">
                  Categorías existentes
                  {!loading && !error && (
                    <span className="admin-badge">
                      {categories.length} en total
                    </span>
                  )}
                </h2>

                {loading && <p className="mt-2">Cargando categorías...</p>}
                {error && <p className="text-danger mt-2">{error}</p>}

                {!loading && !error && categories.length === 0 && (
                  <p className="mt-2">Todavía no has creado ninguna categoría.</p>
                )}

                {!loading && !error && categories.length > 0 && (
                  <ul className="list-group admin-list mt-2">
                    {categories.map((cat) => (
                      <li
                        key={cat.id}
                        className="list-group-item admin-list__item d-flex justify-content-between align-items-center"
                      >
                        {editingId === cat.id ? (
                          <form
                            className="d-flex flex-grow-1 gap-2 align-items-center"
                            onSubmit={handleUpdateCategory}
                          >
                            <input
                              type="text"
                              className="form-control admin-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm admin-btn-primary">
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm admin-btn-secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="d-flex flex-column">
                              <span className="admin-list__name">{cat.name_category}</span>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm admin-btn-ghost"
                                onClick={() => handleStartEdit(cat)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm admin-btn-danger"
                                onClick={() => handleDeleteCategory(cat.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
