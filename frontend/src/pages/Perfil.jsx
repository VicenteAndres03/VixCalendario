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
    
    // Recuperamos datos del LocalStorage
    const nombreGuardado = localStorage.getItem("nombre") || ""
    const apellidoGuardado = localStorage.getItem("apellido") || ""
    const emailGuardado = localStorage.getItem("email") || ""
    const rolGuardado = localStorage.getItem("rol") || "USER"
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"

    // Estados
    const [formData, setFormData] = useState({ nombre: nombreGuardado, apellido: apellidoGuardado, password: "" })
    const [fotoPerfil, setFotoPerfil] = useState(localStorage.getItem("fotoPerfil") || null)
    const [editandoNombre, setEditandoNombre] = useState(false)
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const [cargando, setCargando] = useState(false)

    // 🔥 NUEVO ESTADO PARA EL MODAL DE ELIMINAR CUENTA 🔥
    const [modalConfirmacion, setModalConfirmacion] = useState(false)
    
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
            const res = await axios.get("https://api.vix-flow.com/api/metricas/personales", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRachaActual(res.data.rachaActual || 0)
            setRachaHistorica(res.data.mejorRacha || res.data.rachaActual || 0)
        } catch (error) {
            console.error("Error al cargar métricas para el perfil:", error)
        }
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    // Función para manejar la foto de perfil en el navegador
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result);
                localStorage.setItem("fotoPerfil", reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensaje({ tipo: "", texto: "" })
        
        if (!formData.nombre || !formData.apellido || !formData.password) {
            return setMensaje({ tipo: "error", texto: "El nombre, apellido y contraseña son obligatorios para guardar." })
        }
        if (formData.password.length < 8) {
            return setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." })
        }

        setCargando(true)
        try {
            await actualizarPerfil({ nombre: formData.nombre, apellido: formData.apellido, password: formData.password }, emailGuardado, token)
            
            // Actualizamos en el local storage
            localStorage.setItem("nombre", formData.nombre)
            localStorage.setItem("apellido", formData.apellido)
            
            setMensaje({ tipo: "exito", texto: "¡Tus datos han sido actualizados exitosamente!" })
            setFormData({ ...formData, password: "" }) // Limpiamos la clave por seguridad
        } catch (error) {
            setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "Hubo un problema al actualizar el perfil." })
        } finally {
            setCargando(false)
        }
    }

    // 🔥 NUEVA LÓGICA PARA ELIMINAR CUENTA (SIN WINDOW.CONFIRM) 🔥
    const confirmarEliminacionCuenta = async () => {
        setCargando(true)
        try {
            await eliminarCuenta(emailGuardado, token)
            localStorage.clear()
            // Redirigimos al inicio de inmediato tras el borrado
            window.location.href = "/"
        } catch (error) {
            setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "No se pudo eliminar la cuenta." })
            setModalConfirmacion(false)
            setCargando(false)
        }
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />
            
            <div className="max-w-5xl mx-auto pt-10 px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: Perfil y Ajustes */}
                    <div className="lg:col-span-7 space-y-8">

                        <AnimatePresence>
                            {mensaje.texto && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-xl text-sm font-medium ${mensaje.tipo === "exito" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                                    {mensaje.texto}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CUADRO DE PERFIL GIGANTE */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-3xl border text-center flex flex-col items-center relative overflow-hidden ${darkMode ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" : "bg-white border-gray-200 shadow-xl"}`}>
                            {/* Efecto de fondo brillante detrás del avatar */}
                            {darkMode && <div className="absolute w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl top-[-20%] left-[50%] -translate-x-1/2 pointer-events-none"></div>}
                            
                            {/* Avatar Interactivo */}
                            <div className="relative mb-6 z-10 group">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-5xl font-extrabold shadow-lg shadow-cyan-500/20 border-4 border-gray-950 overflow-hidden relative">
                                    {fotoPerfil ? (
                                        <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.nombre.charAt(0).toUpperCase()
                                    )}
                                    
                                    {/* Capa para subir foto */}
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300">
                                        <span className="text-xl mb-1">📷</span>
                                        <span className="text-[10px] font-bold tracking-wider uppercase text-white">Subir</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                                    </label>
                                </div>
                                {/* Insignia Premium si aplica */}
                                {suscripcion === "ACTIVO" && (
                                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-purple-500 rounded-full border-2 border-gray-950 flex items-center justify-center shadow-lg" title="Usuario Premium">
                                        <span className="text-sm drop-shadow-md">💎</span>
                                    </div>
                                )}
                            </div>

                            {/* Nombre y Botón de Editar */}
                            {editandoNombre ? (
                                <div className="flex flex-col items-center gap-3 w-full max-w-xs z-10 mb-2">
                                    <input 
                                        type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" 
                                        className={`w-full px-4 py-2 rounded-xl text-center text-sm font-bold outline-none border transition-all ${darkMode ? "bg-gray-950/50 border-gray-700 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900"}`} 
                                    />
                                    <input 
                                        type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" 
                                        className={`w-full px-4 py-2 rounded-xl text-center text-sm font-bold outline-none border transition-all ${darkMode ? "bg-gray-950/50 border-gray-700 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900"}`} 
                                    />
                                    <button onClick={() => setEditandoNombre(false)} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 w-full py-2 rounded-xl text-xs font-extrabold tracking-wider transition-colors shadow-lg shadow-cyan-500/20">
                                        LISTO
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3 z-10 mb-4 group/edit">
                                    <h1 className="text-3xl font-extrabold tracking-tight">
                                        {formData.nombre} {formData.apellido}
                                    </h1>
                                    <button 
                                        onClick={() => setEditandoNombre(true)} 
                                        className={`p-2 rounded-full transition-all ${darkMode ? "bg-gray-800/0 hover:bg-gray-800 text-gray-500 hover:text-cyan-400" : "bg-gray-100/0 hover:bg-gray-100 text-gray-400 hover:text-cyan-500"} opacity-50 group-hover/edit:opacity-100`} 
                                        title="Editar nombre"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}

                            <p className={`text-sm mt-1 mb-5 z-10 font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {emailGuardado}
                            </p>

                            <div className="flex gap-2 z-10">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                                    rolGuardado === "ADMIN" ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-gray-800 text-gray-400 border-gray-700"
                                }`}>
                                    {rolGuardado === "ADMIN" ? "Administrador" : "Miembro"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Banner Premium */}
                        {suscripcion !== "ACTIVO" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-cyan-500/10 ${darkMode ? "border-purple-500/30" : "border-purple-200"}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">💎</span>
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Mejora tu Cuenta</h3>
                                </div>
                                <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Descubre todas las características Premium avanzadas y los planes diseñados para ti.</p>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/plan")} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2">
                                    <span>💳 Ver Planes y Beneficios</span>
                                </motion.button>
                            </motion.div>
                        )}

                        {/* SECCIÓN DE SEGURIDAD (CONTRASEÑA) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-8 rounded-2xl border ${darkMode ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" : "bg-white border-gray-200 shadow-xl"}`}>
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-2">
                                <span>🔒</span> Seguridad y Guardado
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className={`text-xs mb-5 p-4 rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                    Para aplicar de forma segura los cambios en tu nombre o cambiar tu clave, por favor <strong>ingresa una nueva contraseña o confirma la actual</strong>.
                                </p>
                                
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Contraseña</label>
                                    <input 
                                        type="password" name="password" value={formData.password} onChange={handleChange} 
                                        placeholder="Mínimo 8 caracteres" 
                                        className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} 
                                    />
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={cargando} type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3.5 rounded-xl transition-all mt-4 disabled:opacity-50 shadow-lg shadow-cyan-500/20">
                                    {cargando ? "Guardando cambios..." : "Guardar todos los cambios"}
                                </motion.button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-800/40">
                                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-1">Zona de Peligro</h3>
                                <p className={`text-xs mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tu cuenta quedará inactiva permanentemente.</p>
                                <motion.button onClick={() => setModalConfirmacion(true)} disabled={cargando} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-semibold py-3 rounded-xl border border-red-500/20 transition-all text-sm">
                                    Eliminar mi cuenta
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* COLUMNA DERECHA: Vitrina de Logros */}
                    <div className="lg:col-span-5">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-8 rounded-3xl border h-full ${darkMode ? "bg-gray-900/40 border-gray-800/80" : "bg-white border-gray-200 shadow-xl"}`}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">Tus Logros</h2>
                                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${darkMode ? 'bg-gray-950 border-gray-800 text-cyan-400' : 'bg-gray-100 border-gray-200 text-cyan-600'}`}>
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

            {/* 🔥 NUEVO MODAL PARA ELIMINAR CUENTA 🔥 */}
            <AnimatePresence>
                {modalConfirmacion && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setModalConfirmacion(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className={`border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl ${darkMode ? "bg-gray-900 border-red-500/30" : "bg-white border-red-200"}`}>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 text-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                ⚠️
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Eliminar Cuenta</h2>
                            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                ¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción borrará todos tus datos, proyectos y progreso. <strong>No se puede deshacer.</strong>
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setModalConfirmacion(false)} disabled={cargando} className={`w-1/2 py-3 rounded-xl font-medium transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminacionCuenta} disabled={cargando} className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all flex justify-center items-center">
                                    {cargando ? "Eliminando..." : "Sí, eliminar"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Perfil