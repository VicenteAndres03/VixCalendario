import { useEffect } from "react"
import axios from "axios"

export function useSyncSuscripcion() {
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        axios.get("https://api.vix-flow.com/api/usuarios/perfil", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (res.data.estadoSuscripcion) {
                localStorage.setItem("suscripcion", res.data.estadoSuscripcion)
            }
        })
        .catch(() => {})
    }, [])
}