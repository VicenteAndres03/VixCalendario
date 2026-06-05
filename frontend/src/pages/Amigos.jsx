import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"
import { obtenerAmigos, obtenerSolicitudes, eliminarAmigoService } from "../services/authService"

function Amigos() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const emailUsuario = localStorage.getItem("email")

    const [amigos, setAmigos] = useState([])
    const [solicitudes, setSolicitudes] = useState([])
    const [emailAmigo, setEmailAmigo] = useState("")
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const [cargando, setCargando] = useState(false)
    const [modalConfirmacion, setModalConfirmacion] = useState({ visible: false, emailAmigoAEliminar: null })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resAmigos, resSolicitudes] = await Promise.all([
                obtenerAmigos(token),
                obtenerSolicitudes(token)
            ])
            setAmigos(resAmigos)
            setSolicitudes(resSolicitudes)
        } catch (error) {
            console.error("Error al cargar datos de amigos:", error)
        }
    }

    const intentarEliminar = (email) => {
        setModalConfirmacion({ visible: true, emailAmigoAEliminar: email })
    }

    const confirmarEliminacion = async () => {
        const emailAEliminar = modalConfirmacion.emailAmigoAEliminar
        if (!emailAEliminar) return

        try {
            await eliminarAmigoService(emailAEliminar, token)
            setMensaje({ tipo: "exito", texto: "Amigo eliminado correctamente." })
            cargarDatos()
            setModalConfirmacion({ visible: false, emailAmigoAEliminar: null })
        } catch (error) {
            let mensajeError = "Hubo un error al intentar eliminar al amigo."
            if (error.response?.data) {
                if (typeof error.response.data === 'string') mensajeError = error.response.data
                else if (error.response.data.message) mensajeError = error.response.data.message
            }
            setMensaje({ tipo: "error", texto: mensajeError })
            setModalConfirmacion({ visible: false, emailAmigoAEliminar: null })
        }
    }

    const enviarSolicitud = async (e) => {
        e.preventDefault()
        setMensaje({ tipo: "", texto: "" })
        if (!emailAmigo) {
            setMensaje({ tipo: "error", texto: "Ingresa el email de tu amigo." })
            return
        }
        setCargando(true)
        try {
            const response = await axios.post("https://api.vix-flow.com/api/amigos/solicitar",
                { emailReceptor: emailAmigo },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMensaje({ tipo: "exito", texto: response.data || "Solicitud enviada correctamente." })
            setEmailAmigo("")
        } catch (error) {
            let mensajeError = "Error al enviar la solicitud."
            if (error.response?.data) {
                if (typeof error.response.data === 'string') mensajeError = error.response.data
                else if (error.response.data.mensaje || error.response.data.message)
                    mensajeError = error.response.data.mensaje || error.response.data.message
            }
            setMensaje({ tipo: "error", texto: mensajeError })
        } finally {
            setCargando(false)
        }
    }

    const responderSolicitud = async (id, accion) => {
        try {
            await axios.put(`https://api.vix-flow.com/api/amigos/${accion}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            cargarDatos()
        } catch (error) {
            console.error(`Error al ${accion} solicitud:`, error)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {darkMode && (
                <>
                    <div className="fixed w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl top-10 left-10 pointer-events-none"></div>
                    <div className="fixed w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl bottom-10 right-10 pointer-events-none"></div>
                </>
            )}

            <div className="p-6 max-w-7xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Mis Amigos</h1>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>Gestiona tus conexiones para colaborar en proyectos.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-2xl border transition-all ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <h2 className="text-xl font-bold text-cyan-500 mb-4">Añadir Amigo</h2>
                            <form onSubmit={enviarSolicitud} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        Email del usuario
                                    </label>
                                    <input
                                        type="email"
                                        value={emailAmigo}
                                        onChange={(e) => setEmailAmigo(e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`}
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>

                                <AnimatePresence>
                                    {mensaje.texto && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-3 rounded-xl text-sm font-medium text-center ${mensaje.tipo === "exito" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
                                        >
                                            {mensaje.texto}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    disabled={cargando}
                                    type="submit"
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all shadow-md shadow-cyan-500/10 disabled:opacity-50"
                                >
                                    {cargando ? "Enviando..." : "Enviar Solicitud"}
                                </motion.button>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className={`p-6 rounded-2xl border transition-all ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Solicitudes</h2>
                                <span className="bg-cyan-500/20 text-cyan-500 px-3 py-1 rounded-full text-xs font-bold">
                                    {solicitudes.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {solicitudes.length === 0 ? (
                                    <p className={`text-sm text-center py-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        No tienes solicitudes pendientes.
                                    </p>
                                ) : (
                                    solicitudes.map((solicitud) => (
                                        <div key={solicitud.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                                                    {solicitud.solicitante?.fotoPerfil ? (
                                                        <img
                                                            src={solicitud.solicitante.fotoPerfil}
                                                            alt={solicitud.solicitante.nombre}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        solicitud.solicitante?.nombre?.charAt(0).toUpperCase() || "?"
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                        {solicitud.solicitante?.nombre || "Usuario"}
                                                    </p>
                                                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {solicitud.solicitante?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => responderSolicitud(solicitud.id, "aceptar")}
                                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-xs font-bold py-2 rounded-lg transition-colors"
                                                >
                                                    Aceptar
                                                </button>
                                                <button
                                                    onClick={() => responderSolicitud(solicitud.id, "rechazar")}
                                                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${darkMode ? "bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-300" : "bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700"}`}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className={`p-6 rounded-2xl border min-h-[500px] transition-all ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <h2 className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>Mis Conexiones</h2>

                            {amigos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="text-6xl mb-4 opacity-50">👥</div>
                                    <h3 className={`text-lg font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aún no tienes amigos</h3>
                                    <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        Envía solicitudes usando el panel izquierdo para empezar a colaborar.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {amigos.map((amigo) => {
                                        const esSolicitante = amigo.solicitante?.email === emailUsuario
                                        const datosAmigo = esSolicitante ? amigo.receptor : amigo.solicitante

                                        return (
                                            <div key={amigo.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all hover:-translate-y-1 ${darkMode ? "bg-gray-800 border-gray-700 hover:border-cyan-500/50" : "bg-gray-50 border-gray-200 hover:border-cyan-400 shadow-sm"}`}>
                                                <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden">
                                                    {datosAmigo?.fotoPerfil ? (
                                                        <img
                                                            src={datosAmigo.fotoPerfil}
                                                            alt={datosAmigo.nombre}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        datosAmigo?.nombre?.charAt(0).toUpperCase() || "?"
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className={`font-bold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                        {datosAmigo?.nombre || "Usuario"}
                                                    </p>
                                                    <p className={`text-sm truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {datosAmigo?.email}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => intentarEliminar(datosAmigo?.email)}
                                                    className="ml-auto shrink-0 flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Eliminar amigo"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {modalConfirmacion.visible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setModalConfirmacion({ visible: false, emailAmigoAEliminar: null })}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className={`border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl ${darkMode ? "bg-gray-900 border-red-500/30" : "bg-white border-red-200"}`}>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 text-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                ⚠️
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Eliminar Amigo</h2>
                            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                ¿Estás seguro de que deseas eliminar a este usuario de tus amigos? Ya no podrán colaborar juntos.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setModalConfirmacion({ visible: false, emailAmigoAEliminar: null })} className={`w-1/2 py-3 rounded-xl font-medium transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminacion} className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all">
                                    Sí, eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Amigos