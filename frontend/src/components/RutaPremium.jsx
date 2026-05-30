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

        axios.get("http://localhost:8080/api/usuarios/perfil", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const suscripcion = res.data.estadoSuscripcion || "INACTIVO"
            localStorage.setItem("suscripcion", suscripcion)
            setEsPremium(suscripcion === "ACTIVO")
        })
        .catch(() => {
            setEsPremium(false)
        })
        .finally(() => {
            setVerificado(true)
        })
    }, [])

    if (!verificado) {
        return null // o un spinner si prefieres
    }

    if (!esPremium) {
        return <Navigate to="/plan" replace />
    }

    return children
}

export default RutaPremium