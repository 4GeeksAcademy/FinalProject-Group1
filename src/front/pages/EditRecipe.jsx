import { Toaster, toast } from "sonner"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// 🟢 1. IMPORTACIÓN CORREGIDA: Usamos tu hook global
import useGlobalReducer from '../hooks/useGlobalReducer';

// URL base de tu backend (usando la variable de entorno que me mostraste)
const urlBase = import.meta.env.VITE_BACKEND_URL;

// Datos estáticos (MOCK_CATEGORIES, initialIngredient, etc. - si los necesitas)

const EditRecipe = () => {
    // 🟢 2. OBTENER EL ESTADO GLOBAL (store) y el token
    const { store } = useGlobalReducer();
    const token = store.token; // Accedemos al token directamente del estado

    const navigate = useNavigate();
    const { recipe_id } = useParams(); 
    
    const [recipeData, setRecipeData] = useState({
        title: '',
        steps: '',
        prep_time_min: 0,
        difficulty: 'facil', 
        portions: 1,
        category_id: 1,
        // Agrega aquí todos los demás campos de tu modelo que se cargan:
        image: '', // Para la URL actual de la imagen
        nutritional_data: '',
        // Importante: No ponemos 'ingredients' aquí porque se inicializa por separado.
    });
    
    // Asumimos que ingredients es un array de objetos {name, quantity, unit_measure}
    const initialIngredient = { name: '', quantity: 0, unit_measure: 'gramos' };
    const [ingredients, setIngredients] = useState([initialIngredient]);

    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true); // Se inicia en true para mostrar el loader al cargar
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); 

    // --- FUNCIÓN PARA CARGAR LA RECETA EXISTENTE (GET) ---
    const fetchRecipeData = async () => {
        setLoading(true);
        
        // El token se chequea aquí antes de la llamada
        if (!token || !recipe_id) {
            setLoading(false);
            toast.error("Falta token o ID de receta para cargar.");
            return;
        }

        try {
            const response = await fetch(`${urlBase}/recipes/${recipe_id}`, {
                headers: {
                    // 🟢 3. USAMOS EL TOKEN DEL ESTADO GLOBAL EN EL GET
                    "Authorization": `Bearer ${token}`, 
                },
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Cargar datos en los estados
                setRecipeData({
                    title: data.title,
                    steps: data.steps,
                    prep_time_min: data.prep_time_min, 
                    difficulty: data.difficulty.toLowerCase(), 
                    portions: data.portions,
                    category_id: data.category_id,
                    nutritional_data: data.nutritional_data || '',
                    // ... otros campos
                });

                // Cargar la URL de la imagen existente y los ingredientes
                setImagePreviewUrl(data.image); 

                const loadedIngredients = data.ingredients.map(ing => ({
                    name: ing.name, 
                    quantity: ing.quantity,
                    unit_measure: ing.unit_measure.toLowerCase(),
                }));
                setIngredients(loadedIngredients.length > 0 ? loadedIngredients : [initialIngredient]);
                
                toast.success(`Receta "${data.title}" cargada exitosamente.`);
            } else {
                toast.error(data.message || "Error al cargar los datos de la receta.");
                navigate('/dashboard'); 
            }
        } catch (error) {
            toast.error("Error de conexión al cargar la receta. (CORS o Red)");
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar la carga de datos al montar el componente o si cambia el ID
    useEffect(() => {
        // Aseguramos que tenemos un token antes de intentar cargar, 
        // aunque el check también está dentro de fetchRecipeData
        if (recipe_id && token) {
            fetchRecipeData();
        } else if (recipe_id && !token) {
             setLoading(false); // Detenemos la carga si falta el token
        }
    }, [recipe_id, token]); // Dependencia del token para reintentar si el usuario inicia sesión

    // --- MANEJADORES DEL FORMULARIO ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipeData(prev => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, e) => {
        const { name, value } = e.target;
        const newIngredients = ingredients.map((item, i) => {
            if (index === i) {
                const val = name === 'quantity' ? parseFloat(value) : value;
                return { ...item, [name]: val };
            }
            return item;
        });
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients(prev => [...prev, initialIngredient]);
    };

    const removeIngredient = (index) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        }
    };

    // --- FUNCIÓN DE ENVÍO (PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!token) {
            toast.error("Debes iniciar sesión para editar una receta.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        
        // 1. Agregar campos de receta
        Object.keys(recipeData).forEach(key => {
            formData.append(key, recipeData[key]);
        });
        
        // 2. Agregar imagen (si se seleccionó un archivo nuevo)
        if (imageFile) {
            formData.append("image", imageFile);
        }
        
        // 3. Agregar ingredientes como JSON string
        formData.append("ingredients_json", JSON.stringify(ingredients));

        // 4. Envío al Backend
        try {
            const response = await fetch(`${urlBase}/recipes/${recipe_id}`, {
                method: "PUT", 
                headers: {
                    // 🟢 4. USAMOS EL TOKEN DEL ESTADO GLOBAL EN EL PUT
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("¡Receta editada con éxito!");
                navigate(`/recipes/${recipe_id}`); 
            } else {
                toast.error(data.message || "Error al editar la receta.");
            }
        } catch (error) {
            toast.error("Error de red al intentar editar la receta.");
        } finally {
            setLoading(false);
        }
    };

    // Si está cargando datos y aún no tenemos el título, muestra un loader
    if (loading && !recipeData.title) {
        return <div className="text-center mt-5">Cargando datos de la receta...</div>; 
    }
    
    // Si la carga falló (ej. por CORS) y el token existe, mostramos el formulario vacío 
    // y el usuario podrá ver los errores de red en la consola (si el CORS falla).
    if (!recipeData.title && !loading) {
         return <div className="text-center mt-5 text-danger">Error: No se pudieron cargar los datos. Revisa la consola y tu configuración CORS.</div>;
    }


    // --- RENDERIZADO DEL FORMULARIO ---
    return (
        <div className="container mt-5">
            <h2>{`Editar Receta: ${recipeData.title}`}</h2>
            <form onSubmit={handleSubmit}>
                
                {/* 1. TÍTULO Y PASOS */}
                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        type="text"
                        name="title"
                        value={recipeData.title}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Pasos de Preparación</label>
                    <textarea
                        name="steps"
                        value={recipeData.steps}
                        onChange={handleChange}
                        className="form-control"
                        rows="5"
                        required
                    />
                </div>
                
                {/* 2. METADATOS: TIEMPO, DIFICULTAD, PORCIONES, CATEGORIA */}
                 <div className="row mb-3">
                    <div className="col-md-3">
                        <label className="form-label">Tiempo Prep. (min)</label>
                        <input
                            type="number"
                            name="prep_time_min"
                            value={recipeData.prep_time_min}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Dificultad</label>
                        <select
                            name="difficulty"
                            value={recipeData.difficulty}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="facil">Fácil</option>
                            <option value="media">Media</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Porciones</label>
                        <input
                            type="number"
                            name="portions"
                            value={recipeData.portions}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Categoría</label>
                        <input
                            type="number"
                            name="category_id"
                            value={recipeData.category_id}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="ID de Categoría"
                            required
                        />
                    </div>
                </div>

                {/* 3. IMAGEN Y VISTA PREVIA */}
                <div className="mb-3">
                    <label className="form-label">Imagen (Opcional)</label>
                    {imagePreviewUrl && (
                        <div className="my-2">
                            <img src={imagePreviewUrl} alt="Vista previa actual" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                            <p className="text-muted">Selecciona una nueva imagen solo si deseas reemplazar la actual.</p>
                        </div>
                    )}
                    <input
                        type="file"
                        name="image"
                        onChange={handleImageChange}
                        className="form-control"
                        accept="image/*"
                    />
                </div>

                {/* 4. SECCIÓN DE INGREDIENTES DINÁMICOS */}
                <h4 className="mt-4">Ingredientes</h4>
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="row mb-2 align-items-center">
                        <div className="col-4">
                             <input type="text" name="name" value={ingredient.name} onChange={(e) => handleIngredientChange(index, e)} className="form-control" placeholder="Nombre (ej: Huevo)" required />
                        </div>
                        <div className="col-3">
                            <input type="number" name="quantity" value={ingredient.quantity} onChange={(e) => handleIngredientChange(index, e)} className="form-control" placeholder="Cantidad" required />
                        </div>
                        <div className="col-4">
                            <select name="unit_measure" value={ingredient.unit_measure} onChange={(e) => handleIngredientChange(index, e)} className="form-select" required >
                                <option value="gramos">Gramos (g)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="unidades">Unidades</option>
                            </select>
                        </div>
                        <div className="col-1">
                            <button 
                                type="button" 
                                onClick={() => removeIngredient(index)}
                                className="btn btn-danger btn-sm"
                                disabled={ingredients.length === 1}
                            >
                                X
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addIngredient} className="btn btn-secondary mb-4">
                    + Añadir Ingrediente
                </button>
                
                {/* BOTÓN FINAL */}
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditRecipe;
