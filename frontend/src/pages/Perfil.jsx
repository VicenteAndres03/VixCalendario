import { useState, useContext, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import { actualizarPerfil, eliminarCuenta } from "../services/authService"
import axios from "axios"

const LOGROS = [
    { dias: 7, titulo: "Explorador", desc: "Temas Visuales", emoji: "🎨", color: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/20" },
    { dias: 14, titulo: "Constante", desc: "Emblema de Bronce", emoji: "🥉", color: "from-orange-700 to-amber-700", shadow: "shadow-orange-500/20" },
    { dias: 30, titulo: "Disciplinado", desc: "Emblema de Plata", emoji: "🥈", color: "from-slate-300 to-gray-400", shadow: "shadow-slate-500/20" },
    { dias: 60, titulo: "Maestro Focus", desc: "Temporizador Pomodoro", emoji: "⏱️", color: "from-yellow-400 to-amber-500", shadow: "shadow-yellow-500/20" },
    { dias: 90, titulo: "Leyenda Vix", desc: "Emblema Diamante", emoji: "💎", color: "from-cyan-400 to-blue-500", shadow: "shadow-cyan-500/20" },
]

function Perfil() {
    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const nombreGuardado = localStorage.getItem("nombre") || ""
    const emailGuardado = localStorage.getItem("email") || ""

    const [formData, setFormData] = useState({ nombre: nombreGuardado, apellido: "", password: "" })
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const [cargando, setCargando] = useState(false)
    
    // 🏆 Estado para la Gamificación
    const [rachaHistorica, setRachaHistorica] = useState(0)
    const [rachaActual, setRachaActual] = useState(0)

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get("pago") === "exitoso") {
            setMensaje({ tipo: "exito", texto: "¡Pago completado! Estamos validando tu suscripción Premium 💎" });
        }
        cargarMetricas()
    }, [])

    const cargarMetricas = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/metricas/personales", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRachaActual(res.data.rachaActual || 0)
            setRachaHistorica(res.data.mejorRacha || res.data.rachaActual || 0) // Usamos la mejor racha para los trofeos
        } catch (error) {
            console.error("Error al cargar métricas para el perfil:", error)
        }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensaje({ tipo: "", texto: "" })
        if (!formData.nombre || !formData.apellido || !formData.password) {
            return setMensaje({ tipo: "error", texto: "Todos los campos son obligatorios." })
        }
        if (formData.password.length < 8) {
            return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." })
        }

        setCargando(true)
        try {
            await actualizarPerfil({ nombre: formData.nombre, apellido: formData.apellido, password: formData.password }, emailGuardado, token)
            localStorage.setItem("nombre", formData.nombre)
            setMensaje({ tipo: "exito", texto: "¡Perfil modificado de manera exitosa!" })
        } catch (error) {
            setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "Hubo un problema al actualizar el perfil." })
        } finally {
            setCargando(false)
        }
    }

    const handleEliminarCuenta = async () => {
        if (window.confirm("¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción desactivará tu acceso y cerrará la sesión actual.")) {
            setCargando(true)
            try {
                await eliminarCuenta(emailGuardado, token)
                localStorage.removeItem("token")
                localStorage.removeItem("nombre")
                localStorage.removeItem("email")
                localStorage.removeItem("rol")
                alert("Tu cuenta ha sido eliminada correctamente.")
                window.location.href = "/"
            } catch (error) {
                setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "No se pudo eliminar la cuenta." })
                setCargando(false)
            }
        }
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />
            
            <div className="max-w-4xl mx-auto pt-12 px-4 pb-12">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: Banner y Formulario */}
                    <div className="lg:col-span-7 space-y-8">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-cyan-500/10 ${darkMode ? "border-purple-500/30" : "border-purple-200"}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">💎</span>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Mejora tu Cuenta</h3>
                            </div>
                            <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Descubre todas las características Premium avanzadas y los planes diseñados para ti.</p>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/plan")} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                                <span>💳 Ver Planes y Beneficios</span>
                            </motion.button>
                        </motion.div>

                        <AnimatePresence>
                            {mensaje.texto && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-xl text-sm font-medium ${mensaje.tipo === "exito" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                                    {mensaje.texto}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-2xl border ${darkMode ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" : "bg-white border-gray-200 shadow-xl"}`}>
                            <h1 className="text-2xl font-bold mb-6 text-center tracking-tight">Datos Personales</h1>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Apellido</label>
                                        <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Correo Electrónico</label>
                                    <input type="email" value={emailGuardado} disabled className={`w-full px-4 py-3 rounded-xl border text-sm font-medium opacity-60 cursor-not-allowed ${darkMode ? "bg-gray-950/30 border-gray-800 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"}`} />
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nueva Contraseña</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} />
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={cargando} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50 shadow-lg shadow-cyan-500/20">
                                    {cargando ? "Guardando..." : "Actualizar Perfil"}
                                </motion.button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-800/40">
                                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-1">Zona de Peligro</h3>
                                <p className={`text-xs mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tu cuenta quedará inactiva permanentemente.</p>
                                <motion.button onClick={handleEliminarCuenta} disabled={cargando} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold py-2.5 rounded-xl border border-red-500/20 transition-all text-sm">
                                    Eliminar mi cuenta
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* COLUMNA DERECHA: Vitrina de Logros */}
                    <div className="lg:col-span-5">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-2xl border h-full ${darkMode ? "bg-gray-900/40 border-gray-800/80" : "bg-white border-gray-200 shadow-xl"}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">Tus Logros</h2>
                                <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${darkMode ? 'bg-gray-950 border-gray-800 text-cyan-400' : 'bg-gray-100 border-gray-200 text-cyan-600'}`}>
                                    🔥 Máx: {rachaHistorica}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {LOGROS.map((logro) => {
                                    const desbloqueado = rachaHistorica >= logro.dias;
                                    return (
                                        <div 
                                            key={logro.dias} 
                                            className={`relative overflow-hidden flex items-center p-4 rounded-2xl border transition-all duration-500 ${
                                                desbloqueado 
                                                    ? `${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-md'}` 
                                                    : `${darkMode ? 'bg-gray-950/50 border-gray-800/50 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'}`
                                            }`}
                                        >
                                            {/* Fondo brillante para los desbloqueados */}
                                            {desbloqueado && (
                                                <div className={`absolute inset-0 bg-gradient-to-r ${logro.color} opacity-5`}></div>
                                            )}

                                            <div className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl mr-4 z-10 ${
                                                desbloqueado ? `bg-gradient-to-br ${logro.color} shadow-lg ${logro.shadow}` : `${darkMode ? 'bg-gray-800 grayscale' : 'bg-gray-200 grayscale'}`
                                            }`}>
                                                <span className={desbloqueado ? "drop-shadow-md" : ""}>{logro.emoji}</span>
                                            </div>

                                            <div className="z-10 flex-1">
                                                <h4 className={`font-bold text-base ${desbloqueado ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                                    {logro.titulo}
                                                </h4>
                                                <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {desbloqueado ? logro.desc : `Alcanza ${logro.dias} días de racha`}
                                                </p>
                                            </div>

                                            {!desbloqueado && (
                                                <div className="text-xl opacity-30">🔒</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className={`mt-8 p-4 rounded-xl text-center text-sm font-medium border border-dashed ${darkMode ? 'bg-gray-950 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'}`}>
                                <p>La constancia es la clave del éxito. ¡Mantén tu fuego vivo para coleccionar todas las medallas!</p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Perfil