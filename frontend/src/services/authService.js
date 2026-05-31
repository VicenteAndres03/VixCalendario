import axios from "axios"

const API_URL = "http://15.228.17.114:8080/api";
export const registrar = async (datos) => {
    const response = await axios.post(`${API_URL}/usuarios/registro`, datos)
    return response.data
}

export const login = async (datos) => {
    const response = await axios.post(`${API_URL}/usuarios/login`, datos)
    return response.data
}

export const actualizarPerfil = async (datos, email, token) => {
    // Agregamos "/modificar" a la URL para que coincida exactamente con el backend
    const response = await axios.put(`${API_URL}/usuarios/modificar`, datos, {
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

export const obtenerAmigos = async (token) => {
    const response = await axios.get(`${API_URL}/amigos/lista`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const obtenerSolicitudes = async (token) => {
    const response = await axios.get(`${API_URL}/amigos/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export const eliminarAmigoService = async (emailAmigo, token) => {
    const response = await axios.delete(`${API_URL}/amigos/eliminar`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { emailAmigo }
    })
    return response.data
}

export const recuperarPasswordService = async (email) => {
    const response = await axios.post(`${API_URL}/usuarios/recuperar-password`, null, {
        params: { email }
    })
    return response.data
}

export const enviarMensajeSoporte = async (datos) => {
    // Si en SecurityConfig.java esta ruta no está pública, esto requerirá token. 
    // Por ahora la dejamos como la tenías.
    const response = await axios.post(`${API_URL}/soporte/enviar`, datos)
    return response.data
}

// ─────────────────────────────────────────
// NUEVA FUNCIÓN: Generar Link de Mercado Pago
// ─────────────────────────────────────────
export const crearSuscripcion = async (email, token) => {
    const response = await axios.post(`${API_URL}/pagos/crear-suscripcion?email=${email}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; 
};