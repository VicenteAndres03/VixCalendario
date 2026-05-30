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

export const actualizarPerfil = async (datos, email, token) => {
    const response = await axios.put(`${API_URL}/usuarios`, datos, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email }
    })
    return response.data
}

export const eliminarCuenta = async (email, token) => {
    const response = await axios.delete(`${API_URL}/usuarios/borrar`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email }
    })
    return response.data
}

// ─────────────────────────────────────────
// NUEVA FUNCIÓN: Generar Link de Pago Flow
// ─────────────────────────────────────────
export const generarLinkPago = async (token) => {
    const response = await axios.post(`${API_URL}/pagos/generar-link`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
    // Flow nos devuelve la URL en formato texto (String)
    return response.data
}

// Funciones de Admin que habíamos creado antes (las mantengo por si acaso)
export const obtenerTodosLosUsuarios = async (token) => {
    const response = await axios.get(`${API_URL}/usuarios/admin/todos`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const cambiarSuscripcionAdmin = async (id, estado, token) => {
    const response = await axios.put(`${API_URL}/usuarios/admin/suscripcion/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        params: { estado }
    })
    return response.data
}

export const eliminarUsuarioAdmin = async (id, token) => {
    const response = await axios.delete(`${API_URL}/usuarios/admin/eliminar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}