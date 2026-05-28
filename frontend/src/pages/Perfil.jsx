import { useState, useContext, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import { actualizarPerfil, eliminarCuenta } from "../services/authService"

function Perfil() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const nombreGuardado = localStorage.getItem("nombre") || ""
    const emailGuardado = localStorage.getItem("email") || ""

    const [formData, setFormData] = useState({
        nombre: nombreGuardado,
        apellido: "",
        password: ""
    })
    
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        // Carga inicial si es necesaria
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensaje({ tipo: "", texto: "" })

        if (!formData.nombre || !formData.apellido || !formData.password) {
            setMensaje({ tipo: "error", texto: "Todos los campos son obligatorios." })
            return
        }

        if (formData.password.length < 8) {
            setMensaje({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." })
            return
        }

        setCargando(true)
        try {
            // Utilizamos la función de tu authService
            await actualizarPerfil({
                nombre: formData.nombre,
                apellido: formData.apellido,
                password: formData.password
            }, emailGuardado, token)
            
            localStorage.setItem("nombre", formData.nombre)
            setMensaje({ tipo: "exito", texto: "¡Perfil modificado de manera exitosa!" })
        } catch (error) {
            setMensaje({ 
                tipo: "error", 
                texto: error.response?.data?.mensaje || "Hubo un problema al actualizar el perfil." 
            })
        } finally {
            setCargando(false)
        }
    }

    const handleEliminarCuenta = async () => {
        const confirmacion = window.confirm(
            "¿Estás completamente seguro de que deseas eliminar tu cuenta? Esta acción desactivará tu acceso y cerrará la sesión actual."
        )

        if (confirmacion) {
            setCargando(true)
            setMensaje({ tipo: "", texto: "" })
            try {
                // Utilizamos la función de tu authService
                await eliminarCuenta(emailGuardado, token)

                localStorage.removeItem("token")
                localStorage.removeItem("nombre")
                localStorage.removeItem("email")

                alert("Tu cuenta ha sido eliminada correctamente.")
                window.location.href = "/"
            } catch (error) {
                setMensaje({ 
                    tipo: "error", 
                    texto: error.response?.data?.mensaje || "No se pudo eliminar la cuenta de manera correcta." 
                })
                setCargando(false)
            }
        }
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />
            
            <div className="max-w-md mx-auto pt-28 px-4 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-2xl border ${
                        darkMode 
                            ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" 
                            : "bg-white border-gray-200 shadow-xl"
                    }`}
                >
                    <h1 className="text-2xl font-bold mb-6 text-center tracking-tight">Configuración de Perfil</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                                    darkMode 
                                        ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" 
                                        : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"
                                }`}
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                                    darkMode 
                                        ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" 
                                        : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"
                                }`}
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={emailGuardado}
                                disabled
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium opacity-60 cursor-not-allowed ${
                                    darkMode 
                                        ? "bg-gray-950/30 border-gray-800 text-gray-400" 
                                        : "bg-gray-100 border-gray-200 text-gray-500"
                                }`}
                            />
                        </div>

                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                                    darkMode 
                                        ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" 
                                        : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"
                                }`}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        <AnimatePresence>
                            {mensaje.texto && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`p-4 rounded-xl text-sm font-medium ${
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
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                        >
                            {cargando ? "Guardando..." : "Actualizar Perfil"}
                        </motion.button>
                    </form>

                    {/* Zona de Peligro */}
                    <div className="mt-8 pt-6 border-t border-gray-800/40">
                        <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-1">Zona de Peligro</h3>
                        <p className={`text-xs mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Al confirmar, tu cuenta quedará inactiva y se agregará tu token a la lista de bloqueo.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleEliminarCuenta}
                            disabled={cargando}
                            className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-gray-950 font-semibold py-2.5 rounded-xl border border-red-500/20 transition-all text-sm disabled:opacity-50"
                        >
                            Eliminar mi cuenta
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Perfil;