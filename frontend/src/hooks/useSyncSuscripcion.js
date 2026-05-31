import { useEffect } from "react"
import axios from "axios"

export function useSyncSuscripcion() {
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return

        axios.get("http://15.228.17.114:8080/api/usuarios/perfil", {
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