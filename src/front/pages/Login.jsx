import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { Toaster, toast } from "sonner"

const initialUserState = {
    username: "",
    password: "",
}

const urlBase = import.meta.env.VITE_BACKEND_URL

const Login = () => {
    const [user, setUser] = useState(initialUserState)
    const [showPassword, setShowPassword] = useState(false)

    const { dispatch } = useGlobalReducer()
    const navigate = useNavigate()


    const handleChange = ({ target }) => {
        const { name, value } = target
        setUser({
            ...user,
            [name]: value
        })
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }; 

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response =
             await fetch(`${urlBase}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)

            })
            const data = await response.json()

            if (response.ok) {
                dispatch({ type: "SET_TOKEN", payload: data.token })


                const responseUser = await fetch(`${urlBase}/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${data.token}`
                    }
                })

                const dataUser = await responseUser.json()
                dispatch({
                    type: "SET_USER",
                    payload: dataUser.user
                })

                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(dataUser.user))

                navigate("/")
            } else {
                toast.error("Credenciales incorrectas. Intenta de nuevo.")
            }

        } catch (error) {
            console.log(error)
            toast.error("Error de conexión. Intenta de nuevo más tarde.")
        }
    }

    return (
        <div className="container vh-100 d-flex flex-column justify-content-center">
            <Toaster position="top-center" richColors />
            <div className="row justify-content-center">
                <div className="col-7">
                    <h1 className="text-center bg-warning-subtle mx-5 p-4">Ingresa ActívaT</h1>
                </div>
                <div className="col-12 col-md-6 py-4">
                    <form
                        onSubmit={handleSubmit}
                        className="border border-secundary p-5"
                    >
                        <div className="form-group mb-3">
                            <label htmlFor="btnUsername" className="mb-2"><b>Username:</b> </label>
                            <input
                                type="text"
                                placeholder="nombre de usuario"
                                className="form-control"
                                id="btnUsername"
                                name="username"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group my-4">
                            <label htmlFor="btnPassword" className="mb-2" ><b>Contraseña: </b></label>
                            <div className="input-group"> 
                                <input
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="******************"
                                    className="form-control"
                                    id="btnPassword"
                                    name="password"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button" 
                                    className="btn btn-outline-secondary"
                                    onClick={togglePasswordVisibility} 
                                >
                                    {showPassword ? (
                                        <i class="fa-solid fa-eye-slash"></i>
                                    ) : (
                                        <i class="fa-solid fa-eye"></i> 
                                    )}
                                </button>
                            </div>
                        </div>
                        <button className="btn btn-outline-primary w-100">Iniciar Sesión</button>
                    </form>
                </div>
                <div className="w-100"></div>
                <div className="col-12 col-md-6 d-flex justify-content-between my-1">
                    <Link to="/signup">
                        Registrarme
                    </Link>
                    <Link to= {"/recovery-password"}>
                        Olvidó contraseña
                    </Link>

                </div>

            </div>
        </div>
    )
}


export default Login