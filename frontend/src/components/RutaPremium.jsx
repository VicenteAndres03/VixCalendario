import { Navigate } from "react-router-dom";

function RutaPremium({ children }) {
    // Leemos qué tipo de suscripción tiene el usuario
    const suscripcion = localStorage.getItem("suscripcion");

    // Si NO es ACTIVO (Premium), lo pateamos a la página de planes
    if (suscripcion !== "ACTIVO") {
        return <Navigate to="/plan" replace />;
    }

    // Si es premium, lo dejamos pasar a la vista
    return children;
}

export default RutaPremium;