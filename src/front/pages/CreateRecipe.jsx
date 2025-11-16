import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
// Asumo que el CSS de register.css y Bootstrap están disponibles en el entorno de la aplicación.

// --- ENUMS Y CONSTANTES ---

// Los valores de dificultad deben coincidir con tu DifficultyEnum en el backend
const DIFFICULTIES = ["FÁCIL", "MEDIO", "DIFÍCIL"];

// Las unidades deben coincidir con tu UnitEnum en el backend (ej: GRAMS -> g)
const UNITS = [
    { label: "Gramos (g)", value: "g" },
    { label: "Mililitros (ml)", value: "ml" },
    { label: "Unidades", value: "unidades" },
    { label: "Cucharada", value: "tbsp" },
    { label: "Cucharadita", value: "tsp" },
];

// Simulamos categorías estáticas para el dropdown hasta que tengamos un endpoint para listarlas
const MOCK_CATEGORIES = [
    { id: 1, name: "Postres" },
    { id: 2, name: "Platos Principales" },
    { id: 3, name: "Entradas" },
];

const initialRecipeState = {
    title: "",
    steps: "",
    prep_time_min: 30, // Default 30 min
    difficulty: DIFFICULTIES[0], // Default FÁCIL
    portions: 4, // Default 4
    category_id: MOCK_CATEGORIES[0].id, // Default Postres
};

// Estado inicial para un ingrediente
const initialIngredient = {
    name: "",
    quantity: 0,
    unit_measure: UNITS[0].value,
};

// Obtención de la URL base
// NOTA IMPORTANTE: Para evitar el warning de compilación, he reemplazado el uso de 'import.meta.env' 
// con un valor placeholder. Por favor, asegúrate de reemplazar esta línea con tu variable de entorno real 
// si tu configuración de compilación lo permite, o utiliza la URL directa de tu backend.
// Ejemplo: const urlBase = import.meta.env.VITE_BACKEND_URL;
const urlBase = import.meta.env.VITE_BACKEND_URL;


const CreateRecipe = () => {
    const [recipeData, setRecipeData] = useState(initialRecipeState);
    const [ingredients, setIngredients] = useState([initialIngredient]);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // NOTA IMPORTANTE PARA EL USER
    // En un entorno real, el token JWT del administrador se obtendría aquí
    // a través de un Context o Hook de autenticación.
    // Por ahora, lo simulamos para recordarlo.
    const getAuthToken = () => {
        // Debes reemplazar esta lógica con la obtención real del token JWT
        // de un usuario con rol de ADMINISTRADOR, por ejemplo, desde localStorage.
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Debes iniciar sesión como administrador para crear recetas.");
            return null;
        }
        return token;
    };


    // --- MANEJO DE CAMBIOS DEL FORMULARIO PRINCIPAL ---

    const handleChange = ({ target }) => {
        const { name, value, type } = target;
        setRecipeData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
        } else {
            setImageFile(null);
        }
    };

    // --- MANEJO DINÁMICO DE INGREDIENTES ---

    const handleIngredientChange = (index, { target }) => {
        const { name, value, type } = target;
        const newIngredients = ingredients.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    // Si es cantidad, lo parseamos a float
                    [name]: type === 'number' ? parseFloat(value) : value,
                };
            }
            return item;
        });
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        // Solo añadimos si el último ingrediente tiene nombre y cantidad
        const lastIngredient = ingredients[ingredients.length - 1];
        if (lastIngredient.name.trim() && lastIngredient.quantity > 0) {
            setIngredients([...ingredients, initialIngredient]);
        } else {
            toast.warning("Por favor, completa el ingrediente actual antes de agregar uno nuevo.");
        }
    };

    const removeIngredient = (index) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        } else {
            toast.error("Debe haber al menos un ingrediente en la receta.");
        }
    };

    // --- MANEJO DEL ENVÍO DEL FORMULARIO ---

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }

        // 1. Validación Mínima y Estandarización
        if (!imageFile) {
            toast.error("Debes subir una imagen para la receta.");
            setLoading(false);
            return;
        }

        const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity > 0);
        if (validIngredients.length === 0) {
            toast.error("La receta debe tener al menos un ingrediente válido con nombre y cantidad.");
            setLoading(false);
            return;
        }

        // Estandarizar y formatear ingredientes para el backend
        const formattedIngredients = validIngredients.map(item => ({
            name: item.name.trim(), // El backend aplicará .lower()
            quantity: item.quantity,
            unit_measure: item.unit_measure,
        }));


        // 2. Creación del objeto FormData (requerido para enviar archivos)
        const formData = new FormData();

        // A. Añadir campos de texto
        formData.append("title", recipeData.title);
        formData.append("steps", recipeData.steps);
        formData.append("prep_time_min", recipeData.prep_time_min.toString());
        formData.append("difficulty", recipeData.difficulty);
        formData.append("portions", recipeData.portions.toString());
        formData.append("category_id", recipeData.category_id.toString());

        // B. Añadir el archivo de imagen
        formData.append("image", imageFile);

        // C. Añadir el JSON de ingredientes como string
        formData.append("ingredients_json", JSON.stringify(formattedIngredients));


        // 3. Envío al Backend
        try {
            const response = await fetch(`${urlBase}/recipes`, {
                method: "POST",
                headers: {
                    // ¡OJO! No incluyas 'Content-Type': 'application/json' cuando envías FormData. 
                    // El navegador lo gestiona automáticamente con el boundary correcto.
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const successMessage = data.status === 'published'
                    ? "¡Receta creada y publicada con éxito!"
                    : "¡Receta creada! Pendiente de revisión por el administrador.";
                toast.success(successMessage);
                setRecipeData(initialRecipeState);
                setIngredients([initialIngredient]);
                setImageFile(null);
                // Opcional: navegar a la página de la nueva receta o al listado
                setTimeout(() => navigate("/"), 2000); 
            } else {
                // Manejo de errores específicos del backend
                const message = data.message || "Error desconocido al guardar la receta.";
                toast.error(`Error: ${message}`);
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor. Intenta de nuevo más tarde.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };


    // Comprobación de que todos los campos requeridos estén llenos
    const isFormComplete =
        recipeData.title &&
        recipeData.steps &&
        recipeData.prep_time_min > 0 &&
        recipeData.portions > 0 &&
        imageFile &&
        ingredients.every(ing => ing.name.trim() && ing.quantity > 0);


    return (
        // Se añade la dependencia de Bootstrap CSS para que se visualice correctamente
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                crossOrigin="anonymous"
            />
            <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                <Toaster position="top-center" richColors />
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <h1 className="text-center bg-warning-subtle mx-2 p-4 mb-5 rounded-lg shadow-md">Crear Nueva Receta</h1>

                        <form
                            className="border border-secondary form-group p-5 bg-light rounded-lg shadow-lg"
                            onSubmit={handleSubmit}
                        >
                            {/* SECCIÓN 1: DATOS GENERALES DE LA RECETA */}
                            <h4 className="mb-4 text-primary border-bottom pb-2">Información Básica</h4>

                            {/* Título y Categoría */}
                            <div className="row mb-3">
                                <div className="col-md-8 form-group">
                                    <label htmlFor="txtTitle" className="form-label"><b>Título de la Receta:</b></label>
                                    <input
                                        type="text"
                                        placeholder="Brownie de Chocolate"
                                        className="form-control"
                                        id="txtTitle"
                                        name="title"
                                        onChange={handleChange}
                                        value={recipeData.title}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label htmlFor="selectCategory" className="form-label"><b>Categoría:</b></label>
                                    <select
                                        className="form-select"
                                        id="selectCategory"
                                        name="category_id"
                                        onChange={handleChange}
                                        value={recipeData.category_id}
                                        required
                                    >
                                        {MOCK_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tiempo, Dificultad, Porciones */}
                            <div className="row mb-4">
                                <div className="col-md-4 form-group">
                                    <label htmlFor="txtTime" className="form-label"><b>Tiempo de Prep. (min):</b></label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="45"
                                        className="form-control"
                                        id="txtTime"
                                        name="prep_time_min"
                                        onChange={handleChange}
                                        value={recipeData.prep_time_min}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label htmlFor="selectDifficulty" className="form-label"><b>Dificultad:</b></label>
                                    <select
                                        className="form-select"
                                        id="selectDifficulty"
                                        name="difficulty"
                                        onChange={handleChange}
                                        value={recipeData.difficulty}
                                        required
                                    >
                                        {DIFFICULTIES.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 form-group">
                                    <label htmlFor="txtPortions" className="form-label"><b>Porciones:</b></label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="8"
                                        className="form-control"
                                        id="txtPortions"
                                        name="portions"
                                        onChange={handleChange}
                                        value={recipeData.portions}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pasos / Instrucciones */}
                            <div className="form-group mb-4">
                                <label htmlFor="txtSteps" className="form-label"><b>Pasos de Preparación:</b></label>
                                <textarea
                                    placeholder="1. Calentar el horno... 2. Mezclar los ingredientes..."
                                    className="form-control"
                                    id="txtSteps"
                                    name="steps"
                                    rows="4"
                                    onChange={handleChange}
                                    value={recipeData.steps}
                                    required
                                />
                            </div>

                            {/* Carga de Imagen */}
                            <div className="form-group mb-5">
                                <label htmlFor="fileImage" className="form-label"><b>Imagen de la Receta:</b></label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="fileImage"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required
                                />
                                {imageFile && (
                                    <small className="text-success mt-2 d-block">Archivo seleccionado: {imageFile.name}</small>
                                )}
                            </div>


                            {/* SECCIÓN 2: INGREDIENTES DINÁMICOS */}
                            <h4 className="mb-4 text-success border-bottom pb-2">Ingredientes</h4>
                            <p className="alert alert-info py-2 px-3 mb-4">
                                <i className="fa-solid fa-circle-info me-2"></i>
                                **RECUERDA:** Ingresa los ingredientes en **singular** (ej: "Huevo", no "Huevos") para mantener limpio el catálogo.
                            </p>


                            {ingredients.map((item, index) => (
                                <div key={index} className="row g-2 mb-3 align-items-end border p-3 rounded-lg bg-white shadow-sm">
                                    <div className="col-6 col-md-5 form-group">
                                        <label className="form-label">Ingrediente #{index + 1}</label>
                                        <input
                                            type="text"
                                            placeholder="ej: Huevo"
                                            className="form-control"
                                            name="name"
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            value={item.name}
                                            required
                                        />
                                    </div>
                                    <div className="col-3 col-md-3 form-group">
                                        <label className="form-label">Cantidad</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            placeholder="ej: 250.5"
                                            className="form-control"
                                            name="quantity"
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            value={item.quantity}
                                            required
                                        />
                                    </div>
                                    <div className="col-3 col-md-3 form-group">
                                        <label className="form-label">Unidad</label>
                                        <select
                                            className="form-select"
                                            name="unit_measure"
                                            onChange={(e) => handleIngredientChange(index, e)}
                                            value={item.unit_measure}
                                            required
                                        >
                                            {UNITS.map(unit => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-1 d-flex justify-content-end">
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeIngredient(index)}
                                            disabled={ingredients.length === 1}
                                            title="Eliminar Ingrediente"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Botón para añadir nuevo ingrediente */}
                            <div className="d-grid gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-success shadow-md"
                                    onClick={addIngredient}
                                >
                                    <i className="fa-solid fa-circle-plus me-2"></i> Añadir otro ingrediente
                                </button>
                            </div>


                            {/* BOTÓN DE ENVÍO PRINCIPAL */}
                            <button
                                className={`btn btn-primary w-100 mt-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ${loading ? 'opacity-75' : ''}`}
                                type="submit"
                                disabled={!isFormComplete || loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Guardando Receta...
                                    </>
                                ) : (
                                    "Guardar y Publicar Receta"
                                )}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </>
    );
}

export default CreateRecipe;