import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function Amigos() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    
    // Obtenemos nuestro propio email para saber qué lado de la amistad somos
    const emailUsuario = localStorage.getItem("email") 

    const [amigos, setAmigos] = useState([])
    const [solicitudes, setSolicitudes] = useState([])
    const [emailAmigo, setEmailAmigo] = useState("")
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resAmigos, resSolicitudes] = await Promise.all([
                axios.get("http://localhost:8080/api/amigos/lista", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:8080/api/amigos/solicitudes", { headers: { Authorization: `Bearer ${token}` } })
            ])
            setAmigos(resAmigos.data)
            setSolicitudes(resSolicitudes.data)
        } catch (error) {
            console.error("Error al cargar datos de amigos:", error)
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
            const response = await axios.post("http://localhost:8080/api/amigos/solicitar", 
                { emailReceptor: emailAmigo }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMensaje({ tipo: "exito", texto: response.data || "Solicitud enviada correctamente." })
            setEmailAmigo("")
        } catch (error) {
            setMensaje({ 
                tipo: "error", 
                texto: error.response?.data?.mensaje || error.response?.data || "Error al enviar la solicitud." 
            })
        } finally {
            setCargando(false)
        }
    }

    const responderSolicitud = async (id, accion) => {
        try {
            await axios.put(`http://localhost:8080/api/amigos/${accion}/${id}`, {}, {
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
                            className={`p-6 rounded-2xl border transition-all ${
                                darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                            }`}
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
                                        className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${
                                            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                        }`}
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>

                                <AnimatePresence>
                                    {mensaje.texto && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-3 rounded-xl text-sm font-medium text-center ${
                                                mensaje.tipo === "exito" 
                                                    ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            }`}
                                        >
                                            {mensaje.texto}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
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
                            className={`p-6 rounded-2xl border transition-all ${
                                darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                            }`}
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
                                        <div key={solicitud.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${
                                            darkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                                        }`}>
                                            <div>
                                                <p className={`font-bold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                    {solicitud.solicitante?.nombre || "Usuario"}
                                                </p>
                                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {solicitud.solicitante?.email}
                                                </p>
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
                                                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                                                        darkMode ? "bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-300" : "bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700"
                                                    }`}
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
                            className={`p-6 rounded-2xl border min-h-[500px] transition-all ${
                                darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                            }`}
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
                                        // MAGIA AQUÍ: Determinamos dinámicamente a quién mostrar
                                        const esSolicitante = amigo.solicitante?.email === emailUsuario;
                                        const datosAmigo = esSolicitante ? amigo.receptor : amigo.solicitante;

                                        return (
                                            <div key={amigo.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all hover:-translate-y-1 ${
                                                darkMode ? "bg-gray-800 border-gray-700 hover:border-cyan-500/50" : "bg-gray-50 border-gray-200 hover:border-cyan-400 shadow-sm"
                                            }`}>
                                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                                    {datosAmigo?.nombre?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                                        {datosAmigo?.nombre || "Usuario"}
                                                    </p>
                                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {datosAmigo?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Amigos