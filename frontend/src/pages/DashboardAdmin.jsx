import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import { obtenerTodosLosUsuarios, cambiarSuscripcionAdmin, eliminarUsuarioAdmin } from "../services/authService"

function DashboardAdmin() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    // 🔥 NUEVO: Obtenemos el correo del administrador que está usando la página
    const emailUsuario = localStorage.getItem("email") 
    
    const [usuarios, setUsuarios] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarUsuarios()
    }, [])

    const cargarUsuarios = async () => {
        try {
            setCargando(true)
            const data = await obtenerTodosLosUsuarios(token)
            setUsuarios(data)
        } catch (error) {
            console.error("Error cargando usuarios:", error)
            alert("No tienes permisos de administrador o hubo un error al conectar con el servidor.")
        } finally {
            setCargando(false)
        }
    }

    const cambiarSuscripcion = async (id, nuevoEstado) => {
        try {
            await cambiarSuscripcionAdmin(id, nuevoEstado, token)
            
            // 🔥 LA MAGIA EN TIEMPO REAL: Si el usuario que acabo de editar soy yo mismo, actualizo mi navegador al instante
            const usuarioModificado = usuarios.find(u => u.id === id);
            if (usuarioModificado && usuarioModificado.email === emailUsuario) {
                localStorage.setItem("suscripcion", nuevoEstado);
            }

            cargarUsuarios() // Recargamos para ver los cambios en la tabla
        } catch (error) {
            console.error("Error cambiando suscripción", error)
            alert("Hubo un error al intentar cambiar la suscripción.")
        }
    }

    const eliminarUsuario = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar a este usuario permanentemente? Esta acción no se puede deshacer.")) {
            try {
                await eliminarUsuarioAdmin(id, token)
                cargarUsuarios() 
            } catch (error) {
                console.error("Error al eliminar", error)
                alert("Hubo un error al intentar eliminar al usuario.")
            }
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            <div className="p-6 max-w-7xl mx-auto mt-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold">👑 Panel de Administración</h1>
                    <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Gestiona los usuarios, métricas globales y suscripciones de la plataforma.
                    </p>
                </motion.div>

                {/* Resumen de estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-5 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white shadow-sm"}`}>
                        <div className="text-3xl mb-2">👥</div>
                        <div className="text-2xl font-bold text-cyan-400">{usuarios.length}</div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Usuarios Registrados</div>
                    </div>
                    <div className={`p-5 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white shadow-sm"}`}>
                        <div className="text-3xl mb-2">💎</div>
                        <div className="text-2xl font-bold text-purple-400">
                            {usuarios.filter(u => u.estadoSuscripcion === "ACTIVO").length}
                        </div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Usuarios Premium</div>
                    </div>
                    <div className={`p-5 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white shadow-sm"}`}>
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold text-orange-400">
                            {usuarios.length > 0 ? Math.max(...usuarios.map(u => u.mejorRacha || 0)) : 0}
                        </div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Racha Récord Global</div>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className={`rounded-2xl border overflow-hidden ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className={`text-xs uppercase ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Suscripción</th>
                                    <th className="px-6 py-4">Racha Actual</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-cyan-400 animate-pulse font-medium">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className={`text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            No hay usuarios registrados aún.
                                        </td>
                                    </tr>
                                ) : (
                                    usuarios.map((user) => (
                                        <motion.tr 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            key={user.id} 
                                            className={`border-b last:border-0 ${darkMode ? "border-gray-800 hover:bg-gray-800/50" : "border-gray-100 hover:bg-gray-50"}`}
                                        >
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : "?"}
                                                </div>
                                                <span>{user.nombre} {user.apellido}</span>
                                                {user.rol === "ADMIN" && (
                                                    <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">
                                                        ADMIN
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={user.estadoSuscripcion || "INACTIVO"} 
                                                    onChange={(e) => cambiarSuscripcion(user.id, e.target.value)}
                                                    className={`text-xs px-2 py-1.5 rounded outline-none font-bold cursor-pointer transition-colors
                                                        ${user.estadoSuscripcion === "ACTIVO" 
                                                            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                                                            : darkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                                >
                                                    <option value="INACTIVO">GRATUITO</option>
                                                    <option value="ACTIVO">PREMIUM</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-orange-400">
                                                🔥 {user.rachaActual || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.rol !== "ADMIN" ? (
                                                    <button 
                                                        onClick={() => eliminarUsuario(user.id)}
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors text-sm font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                ) : (
                                                    <span className={`text-xs italic ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                                                        Intocable
                                                    </span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardAdmin