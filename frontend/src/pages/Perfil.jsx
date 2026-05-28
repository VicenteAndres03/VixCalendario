import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

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
            await axios.put("http://localhost:8080/api/usuarios/modificar", formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setMensaje({ tipo: "exito", texto: "¡Perfil actualizado con éxito!" })
            
            // Actualizamos el nombre en el LocalStorage para que el Navbar cambie automáticamente
            localStorage.setItem("nombre", formData.nombre)
            
            // Limpiamos el campo de la contraseña por seguridad
            setFormData({ ...formData, password: "" })
            
        } catch (error) {
            setMensaje({ 
                tipo: "error", 
                texto: error.response?.data?.mensaje || "Ocurrió un error al actualizar el perfil." 
            })
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {/* Efectos de fondo en modo oscuro */}
            {darkMode && (
                <>
                    <div className="fixed w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-0 left-0 pointer-events-none"></div>
                    <div className="fixed w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0 pointer-events-none"></div>
                </>
            )}

            <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full max-w-lg p-8 rounded-3xl shadow-xl transition-all relative z-10 ${
                        darkMode ? "bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20" : "bg-white border border-gray-200"
                    }`}
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-cyan-500/30">
                            {formData.nombre?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Mi Perfil
                        </h2>
                        <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {emailGuardado}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${
                                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                }`}
                                placeholder="Mínimo 8 caracteres"
                            />
                            <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                * Por seguridad, ingresa tu contraseña actual o una nueva para guardar los cambios.
                            </p>
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
                </motion.div>
            </div>
        </div>
    )
}

export default Perfil