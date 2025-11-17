import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

const DIFFICULTIES = ["FÁCIL", "MEDIO", "DIFÍCIL"];

const UNITS = [
    { label: "Gramos (g)", value: "g" },
    { label: "Mililitros (ml)", value: "ml" },
    { label: "Unidades", value: "unidades" },
    { label: "Cucharada", value: "tbsp" },
    { label: "Cucharadita", value: "tsp" },
];
  

// OJO. Debo botrrar estas categorías, pues son simuladas para probar. 
const MOCK_CATEGORIES = [
    { id: 1, name: "Postres" },
    { id: 2, name: "Platos Principales" },
    { id: 3, name: "Entradas" },
];

const initialRecipeState = {
    title: "",
    steps: "",
    prep_time_min: 0,
    difficulty: DIFFICULTIES[0],
    portions: 4,
    category_id: MOCK_CATEGORIES[0].id,
};


const initialIngredient = {
    name: "",
    quantity: 0,
    unit_measure: UNITS[0].value,
};



const urlBase = import.meta.env.VITE_BACKEND_URL;


const CreateRecipe = () => {
    const [recipeData, setRecipeData] = useState(initialRecipeState);
    const [ingredients, setIngredients] = useState([initialIngredient]);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getAuthToken = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Debes iniciar sesión para crear recetas.");
            return null;
        }
        return token;
    };


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


    const handleIngredientChange = (index, { target }) => {
        const { name, value, type } = target;
        const newIngredients = ingredients.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    [name]: type === 'number' ? parseFloat(value) : value,
                };
            }
            return item;
        });
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
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


    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }


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


        const formattedIngredients = validIngredients.map(item => ({
            name: item.name.trim(),
            quantity: item.quantity,
            unit_measure: item.unit_measure,
        }));



        const formData = new FormData();

        formData.append("title", recipeData.title);
        formData.append("steps", recipeData.steps);
        formData.append("prep_time_min", recipeData.prep_time_min.toString());
        formData.append("difficulty", recipeData.difficulty);
        formData.append("portions", recipeData.portions.toString());
        formData.append("category_id", recipeData.category_id.toString());
        formData.append("image", imageFile);
        formData.append("ingredients_json", JSON.stringify(formattedIngredients));

        try {
            const response = await fetch(`${urlBase}/recipes`, {
                method: "POST",
                headers: {
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

                setTimeout(() => navigate("/"), 2000);
            } else {
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


    const isFormComplete =
        recipeData.title &&
        recipeData.steps &&
        recipeData.prep_time_min > 0 &&
        recipeData.portions > 0 &&
        imageFile &&
        ingredients.every(ing => ing.name.trim() && ing.quantity > 0);


    return (
        <>
            <div className="container pt-5">
                <Toaster position="top-center" richColors />
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <h1 className="text-center bg-warning-subtle mx-2 p-4 mb-5 shadow">Crear nueva receta</h1>
                        <form
                            className="border border-secondary form-group p-5 bg-light shadow"
                            onSubmit={handleSubmit}
                        >
                            <h4 className="mb-4 text-primary border-bottom pb-2">Completa todos los requerimientos</h4>
                            <div className="row mb-3">
                                <div className="col-md-8 form-group">
                                    <label htmlFor="txtTitle" className="form-label"><b>Título de la Receta:</b></label>
                                    <input
                                        type="text"
                                        placeholder="Torta de limón"
                                        className="form-control"
                                        id="txtTitle"
                                        name="title"
                                        onChange={handleChange}
                                        value={recipeData.title}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label htmlFor="txtCategory" className="form-label"><b>Categoría:</b></label>
                                    <select
                                        className="form-select"
                                        id="txtCategory"
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
                            <div className="row mb-4">
                                <div className="col-md-4 form-group">
                                    <label htmlFor="txtTime" className="form-label"><b>Tiempo de Prep. (min):</b></label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="0"
                                        className="form-control"
                                        id="txtTime"
                                        name="prep_time_min"
                                        onChange={handleChange}
                                        value={recipeData.prep_time_min}
                                        required
                                    />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label htmlFor="txttDifficulty" className="form-label"><b>Dificultad:</b></label>
                                    <select
                                        className="form-select"
                                        id="txttDifficulty"
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
                                        placeholder="4"
                                        className="form-control"
                                        id="txtPortions"
                                        name="portions"
                                        onChange={handleChange}
                                        value={recipeData.portions}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="txtSteps" className="form-label"><b>Pasos de Preparación:</b></label>
                                <textarea
                                    placeholder="1. Calentar el horno... 
                                    2. Mezclar los ingredientes..."
                                    className="form-control"
                                    id="txtSteps"
                                    name="steps"
                                    rows="4"
                                    onChange={handleChange}
                                    value={recipeData.steps}
                                    required
                                />
                            </div>

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

                            <h4 className="mb-4 text-success border-bottom pb-2">Ingredientes</h4>
                            <p className="alert alert-info py-2 px-3 mb-4">
                                <i className="fa-solid fa-circle-info me-2"></i>
                                Por favor ingresa los ingredientes en <b>**singular**</b> (ejemplo: "Huevo", no "Huevos").
                            </p>


                            {ingredients.map((item, index) => (
                                <div key={index} className="row g-2 mb-3 align-items-end border p-3 rounded-lg bg-white shadow-sm">
                                    <div className="col-6 col-md-5 form-group">
                                        <label className="form-label">Ingrediente #{index + 1}</label>
                                        <input
                                            type="text"
                                            placeholder="ejemplo: Tomate"
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
                                            placeholder="ejemplo: 250.5"
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

                            <div className="d-grid gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-success shadow-md"
                                    onClick={addIngredient}
                                >
                                    <i className="fa-solid fa-circle-plus me-2"></i> Añadir otro ingrediente
                                </button>
                            </div>
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