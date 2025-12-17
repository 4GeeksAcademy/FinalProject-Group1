import { json } from "react-router-dom"
import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Toaster, toast } from "sonner"
import "../styles/register.css"


const initialUserState = {
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
}

const urlBase = import.meta.env.VITE_BACKEND_URL

const passwordRequirements = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', regex: /.{8,}/ },
    { key: 'lowerCase', label: 'Al menos una letra minúscula', regex: /[a-z]/ },
    { key: 'upperCase', label: 'Al menos una letra mayúscula', regex: /[A-Z]/ },
    { key: 'number', label: 'Al menos un número', regex: /[0-9]/ },
    { key: 'specialChar', label: 'Al menos un caracter especial (!@#$%^&*...)', regex: /[!@#$%^&*()-+\.]/ },
];

const Register = () => {
    const [user, setUser] = useState(initialUserState)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordValidity, setPasswordValidity] = useState({
        minLength: false,
        lowerCase: false,
        upperCase: false,
        number: false,
        specialChar: false,
    });

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const navigate = useNavigate()

    const validatePassword = (password) => {
        const newValidity = {};
        let isAllValid = true;

        passwordRequirements.forEach(req => {
            const isValid = req.regex.test(password);
            newValidity[req.key] = isValid;
            if (!isValid) {
                isAllValid = false;
            }
        });

        setPasswordValidity(newValidity);
        return isAllValid;
    };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = ({ target }) => {
        const { name, value } = target;

        setUser(prevUser => {
            const newUser = {
                ...prevUser,
                [name]: value
            };
            if (name === 'password') {
                validatePassword(value);
            }

            return newUser;
        });
    }

    const shouldShowRequirements = isPasswordFocused || user.password.length > 0;
    const isPasswordValid = Object.values(passwordValidity).every(isValid => isValid);
    const isFormIncompleteOrInvalid = !user.email || !user.username || !isPasswordValid || user.password !== user.confirmPassword;


    const handleSubmit = async (event) => {
        event.preventDefault()

        if (user.password !== user.confirmPassword) {
            toast.error("Las contraseñas no coinciden. Por favor, revísalas.");
            return;
        }

        if (!isPasswordValid) {
            toast.error("La contraseña no cumple todos los requisitos de seguridad.");
            return;
        }

        const payload = {
            fullname: user.fullname,
            email: user.email,
            password: user.password,
            username: user.username,
        }

        try {
            const response = await fetch(`${urlBase}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json();

            if (response.ok) {
                toast.success("¡Registro exitoso! Bienvenido");
                setUser(initialUserState)
                setTimeout(() => {
                    navigate("/")
                }, 1500)
            } else if (response.status === 409) {
                toast.error("El nombre de usuario ya existe. Intenta con otro.");
            } else if (response.status === 422) {
                toast.error("El correo ya está registrado, inicia sesión.");
            } else {
                toast.error("Error al registrar usuario, intenta nuevamente")
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor. Intenta de nuevo más tarde.");
        }
    }


    return (
        <div className="container bg-fondo">
            <Toaster position="top-center" richColors />
            <div className="d-flex flex-column">
                <div className="row justify-content-center my-4">
                    <div className="col-7 mb-4">
                        <h2 className="d-flex text-center bg-my-tittle justify-content-center mx-5 p-4">Regístrate en la página</h2>
                    </div>
                    <div className="col-12 col-md-6">
                        <form
                            className="border border-secundary form-group p-5 bg-verdes"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-group mb-3">
                                <label htmlFor="txtNAme" className="mb-2"><b>Nombre completo:</b></label>
                                <p className="p-0 m-0 text-danger">opcional</p>
                                <input
                                    type="text"
                                    placeholder="Jhon Doe"
                                    className="form-control"
                                    id="txtNAme"
                                    name="fullname"
                                    onChange={handleChange}
                                    value={user.fullname}
                                />
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="txtEmail" className="mb-2"><b>Correo:</b></label>
                                <input
                                    type="email"
                                    placeholder="ejemplo@email.com"
                                    className="form-control"
                                    id="txtEmail"
                                    name="email"
                                    onChange={handleChange}
                                    value={user.email}
                                />
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="txtUsername" className="mb-2"><b>Nombre de usuario:</b></label>
                                <input
                                    type="text"
                                    placeholder="usuario"
                                    className="form-control"
                                    id="txtUsername"
                                    name="username"
                                    onChange={handleChange}
                                    value={user.username}
                                />
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="btnPassword" className="mb-2"><b>Contraseña:</b> </label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="******************"
                                        className={`form-control ${user.password.length > 0 && (isPasswordValid ? 'is-valid' : 'is-invalid')}`}
                                        id="btnPassword"
                                        name="password"
                                        onChange={handleChange}
                                        value={user.password}
                                        required
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? (
                                            <i className="fa-solid fa-eye-slash"></i>
                                        ) : (
                                            <i className="fa-solid fa-eye"></i>
                                        )}

                                    </button>
                                </div>
                                {shouldShowRequirements && (
                                    <div
                                        className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-inner text-sm border border-gray-300 dark:border-yellow-500 transition-opacity duration-300"
                                    >
                                        <h6 className="font-bold text-base text-gray-800 dark:text-yellow-400 mb-2 border-b border-gray-300 dark:border-yellow-600 pb-1">Seguridad Requerida:</h6>
                                        <ul className="list-unstyled space-y-1">
                                            {passwordRequirements.map(req => {
                                                const isCompleted = passwordValidity[req.key];
                                                return (
                                                    <li
                                                        key={req.key}
                                                        className={`flex items-center transition-colors duration-300 ${isCompleted ? 'text-green-600 line-through opacity-75 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                    >
                                                        <i
                                                            className={`fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-circle-xmark'} w-4 mr-2`}
                                                            style={{ color: isCompleted ? '#10B981' : '#EF4444' }}
                                                        ></i>
                                                        {req.label}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="form-group my-4">
                                <label htmlFor="btnConfirmPassword" className="mb-2"><b>Confirmar Contraseña:</b> </label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="******************"
                                        className={`form-control ${user.confirmPassword.length > 0 && user.password.length > 0 && (user.password === user.confirmPassword ? 'is-valid' : 'is-invalid')}`}
                                        id="btnConfirmPassword"
                                        name="confirmPassword"
                                        onChange={handleChange}
                                        value={user.confirmPassword}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        {showConfirmPassword ? (
                                            <i className="fa-solid fa-eye-slash"></i>
                                        ) : (
                                            <i className="fa-solid fa-eye"></i>
                                        )}
                                    </button>
                                </div>
                                {user.confirmPassword && user.password && user.password !== user.confirmPassword && (
                                    <p className="text-danger mt-2">¡Las contraseñas no coinciden!</p>
                                )}
                            </div>

                            <button
                                className="btn btn-primary w-100 mt-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                                disabled={isFormIncompleteOrInvalid}
                            >
                                Guardar
                            </button>
                            <p className="text-center mt-3 text-sm">
                                ¿Ya tienes una cuenta? <Link to="/login" className="text-blue">Inicia sesión aquí</Link>
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Register;