// Import necessary components and functions from react-router-dom.

import { createBrowserRouter, createRoutesFromElements, Route, } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Register from "./pages/Register";
import { Myprofile } from "./pages/Myprofile";
import { Login } from "./pages/login"; 

export const router = createBrowserRouter(
    createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} /> 
        <Route path="/register" element={< Register />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/myprofile" element={<Myprofile />} />
        
        <Route path="/login" element={<Login />} /> 

        <Route path="/forgot-password" element={<h1>Recuperar Contraseña</h1>} />
        <Route path="/admin-panel" element={<h1>Panel de Administración</h1>} />
        
    </Route>
    )
);