import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const registrar = async (datos) => {
    const response = await axios.post(`${API_URL}/usuarios/registro`, datos)
    return response.data
}

export const login = async (datos) => {
    const response = await axios.post(`${API_URL}/usuarios/login`, datos)
    return response.data
}

// Nueva función para actualizar (respeta tu estructura de datos y URL)
export const actualizarPerfil = async (datos, email, token) => {
    const response = await axios.put(`${API_URL}/usuarios`, datos, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
    })
    return response.data
}

// Nueva función para eliminar (respeta tu estructura de URL)
export const eliminarCuenta = async (email, token) => {
    const response = await axios.delete(`${API_URL}/usuarios/borrar`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email }
    })
    return response.data
}