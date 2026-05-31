import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import axios from "axios"

function RutaPremium({ children }) {
    const [verificado, setVerificado] = useState(false)
    const [esPremium, setEsPremium] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setVerificado(true)
            return
        }

        axios.get("http://15.228.17.114:8080/api/usuarios/perfil", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const suscripcion = res.data.estadoSuscripcion || "INACTIVO"
            const rol = res.data.rol || "USER" 
            
            // Guardamos ambos datos por precaución
            localStorage.setItem("suscripcion", suscripcion)
            localStorage.setItem("rol", rol)

            // 🔥 EL TRUCO ESTÁ AQUÍ: Se aprueba el pase si la cuenta es ACTIVO o si es el ADMIN
            setEsPremium(suscripcion === "ACTIVO" || rol === "ADMIN")
        })
        .catch(() => {
            setEsPremium(false)
        })
        .finally(() => {
            setVerificado(true)
        })
    }, [])

    if (!verificado) {
        return null // Pantalla invisible mientras verifica silenciosamente con el backend
    }

    if (!esPremium) {
        return <Navigate to="/plan" replace />
    }

    return children
}

export default RutaPremium