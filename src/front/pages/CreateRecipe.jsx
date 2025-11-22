import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import "../styles/create_recipe.css"

const DIFFICULTIES = ["FÁCIL", "MEDIO", "DIFÍCIL"];
const UNITS = [
    { label: "Gramos (g)", value: "g" },
    { label: "Mililitros (ml)", value: "ml" },
    { label: "Unidades", value: "unidades" },
    { label: "Cucharada", value: "tbsp" },
    { label: "Cucharadita", value: "tsp" },
];

const initialIngredient = {
    name: "",
    quantity: 0,
    unit_measure: UNITS[0].value,
};

const initialRecipeState = {
    title: "",
    steps: "",
    prep_time_min: 30,
    difficulty: DIFFICULTIES[0],
    portions: 4,
    category_id: null,
    image_url_existing: null,
};

const urlBase = import.meta.env.VITE_BACKEND_URL;


const CreateRecipe = () => {

    const { recipe_id } = useParams();
    const isEditMode = !!recipe_id;

    const [recipeData, setRecipeData] = useState(initialRecipeState);
    const [ingredients, setIngredients] = useState([initialIngredient]);
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getAuthToken = () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            toast.error("Debes iniciar sesión para crear/editar recetas.");
            return null;
        }
        return token;
    };

    const getUserRole = () => {
        const userString = localStorage.getItem("user");
        if (userString) {
            try {
                const user = JSON.parse(userString);
                return user.rol;
            } catch (error) {
                console.error("Error parsing user data:", error);
                return "guest";
            }
        }
        return "guest";
    };


    const loadCategories = async () => {
        try {
            const response = await fetch(`${urlBase}/categories`);
            const data = await response.json();

            if (response.ok) {
                setCategories(data);
                if (data.length > 0 && !isEditMode) {
                    setRecipeData(prev => ({
                        ...prev,
                        category_id: String(data[0].id)
                    }));
                }
            } else {
                toast.error("Error al cargar la lista de categorías.");
            }
        } catch (error) {
            toast.error("Error de conexión al obtener categorías.");
        }
    };


    useEffect(() => {
        loadCategories()
        if (isEditMode) {
            loadRecipeData();
        }
    }, [isEditMode, recipe_id]);


    const loadRecipeData = async () => {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }

        const userRole = getUserRole();

        try {
            const response = await fetch(`${urlBase}/recipes/${recipe_id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                const recipeStatus = data.recipe.status;

                const canAccess = userRole === "admin" || recipeStatus === "pending";

                if (!canAccess) {
                    toast.error("Acceso denegado. Solo los administradores pueden editar recetas publicadas.");
                    navigate("/");
                    return;
                }

                const loadedRecipe = {
                    title: data.recipe.title,
                    steps: data.recipe.steps,
                    prep_time_min: data.recipe.prep_time_min,
                    difficulty: data.recipe.difficulty.toUpperCase(),
                    portions: data.recipe.portions,
                    category_id: String(data.recipe.category_id),
                    image_url_existing: data.recipe.image,
                };

                const loadedIngredients = (data.recipe.ingredients || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    unit_measure: item.unit_measure,
                }));


                setRecipeData(loadedRecipe);
                setIngredients(loadedIngredients.length > 0 ? loadedIngredients : [initialIngredient]);

            } else {
                toast.error(data.message || "Error al cargar los datos de la receta.");
                navigate("/");
            }
        } catch (error) {
            toast.error("Error de conexión al cargar la receta.");
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = ({ target }) => {
        const { name, value, type } = target;
        let newValue = value;

        if (type === 'number') {
            newValue = value === "" ? "" : parseFloat(value);
        }
        setRecipeData(prev => ({
            ...prev,
            [name]: newValue,
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

                let newValue = value;
                if (type === 'number') {
                    newValue = value === "" ? "" : parseFloat(value);
                }

                return {
                    ...item,
                    [name]: newValue,
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


        if (!isEditMode && !imageFile) {
            toast.error("Debes subir una imagen para la receta.");
            setLoading(false);
            return;
        }

        const validIngredients = ingredients.filter(item => item.name.trim() && item.quantity > 0);
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
        formData.append("ingredients_json", JSON.stringify(formattedIngredients));
        if (imageFile) {
            formData.append("image", imageFile);
        }


        const url = isEditMode
            ? `${urlBase}/recipes/${recipe_id}`
            : `${urlBase}/recipes`;
        const method = isEditMode ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                const action = isEditMode ? "editada" : "creada";
                toast.success(`¡Receta ${action} con éxito!`);

                if (isEditMode) {
                    setTimeout(() => navigate("/"), 1000);

                } else {
                    setRecipeData(initialRecipeState);
                    setIngredients([initialIngredient]);
                    setImageFile(null);
                    setTimeout(() => navigate("/"), 2000);
                }
            } else {
                const message = data.message || `Error desconocido al ${isEditMode ? 'editar' : 'guardar'} la receta.`;
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
        (imageFile || recipeData.image_url_existing) &&
        ingredients.some(ing => ing.name.trim() && ing.quantity > 0);


    if (isEditMode && loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando receta para edición...</p>
            </div>
        );
    }


    return (
        <>
            <div className="container py-4 bg-fondo">
                <Toaster position="top-center" richColors />
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <h1 className="text-center d-flex justify-content-center bg-titulo mx-2 p-4 mb-5 rounded-lg shadow-md">
                            {isEditMode ? `Editar Receta #${recipe_id}` : "Crear Nueva Receta"}
                        </h1>

                        <form
                            className="border border-secondary form-group p-5 bg-formulario rounded-lg shadow-lg"
                            onSubmit={handleSubmit}
                        >
                            <h4 className="mb-4 text-success border-bottom pb-2">Información Básica</h4>
                            <div className="row mb-3">
                                <div className="col-md-8 form-group">
                                    <label htmlFor="txtTitle" className="form-label"><b>Título de la Receta:</b></label>
                                    <input
                                        type="text"
                                        placeholder="Papas fritas"
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
                                        value={recipeData.category_id || ""}
                                        required
                                    >
                                        {categories.length === 0 && (
                                            <option value="" disabled>Cargando categorías...</option>
                                        )}
                                        {categories.map(item => (
                                            <option key={item.id} value={String(item.id)}>{item.name_category}</option>
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
                                        {DIFFICULTIES.map(item => (
                                            <option key={item} value={item}>{item}</option>
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
                            <div className="form-group mb-4">
                                <label htmlFor="txtSteps" className="form-label"><b>Pasos de Preparación:</b></label>
                                <textarea
                                    placeholder={`1. Calentar el horno..
2. Mezclar los ingredientes...
3. Agregar condimentos...
4. Poner a cocinar...`}
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
                                    required={!isEditMode || !recipeData.image_url_existing}
                                />
                                {recipeData.image_url_existing && !imageFile && (
                                    <div className="mt-3">
                                        <small className="text-muted d-block mb-1">Imagen actual (Cámbiala subiendo un nuevo archivo):</small>
                                        <img src={recipeData.image_url_existing} alt="Receta actual" className="prevew-image rounded shadow" />
                                    </div>
                                )}
                                {imageFile && (
                                    <small className="text-success mt-2 d-block">Archivo seleccionado para subir: {imageFile.name}</small>
                                )}
                            </div>

                            <h4 className="mb-4 text-success border-bottom pb-2">Ingredientes</h4>
                            <p className="alert alert-primary py-2 px-3 mb-4">
                                <i className="fa-solid fa-circle-info me-2"></i>
                                **OBSERVACIÓN:** Ingresa los ingredientes en **singular** (ej: "Huevo", no "Huevos").
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
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {isEditMode ? "Guardando Cambios..." : "Guardando Receta..."}
                                    </>
                                ) : (
                                    isEditMode ? "Actualizar Receta" : "Guardar y Publicar Receta"
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