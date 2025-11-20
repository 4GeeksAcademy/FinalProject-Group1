import React from "react";
import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"


const AdminProtectedRoute = ({ children }) => {
    const { store } = useGlobalReducer();

    const userRole = store.user ? store.user.rol : null;
    const isAdmin = userRole === "admin";


    if (!store.token) {
        return <Navigate to={"/login"} />;
    }

    if (!isAdmin) {
        return <Navigate to={"/"} />;
    }

    return children;
}

export default AdminProtectedRoute;