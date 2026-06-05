import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"

function Cuadernos() {
    const [cuadernos, setCuadernos] = useState([])
    const [modalAbierto, setModalAbierto] = useState(false)
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevaDescripcion, setNuevaDescripcion] = useState("")
    const [error, setError] = useState("")

    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    
    // 🔒 LÓGICA FREEMIUM DEL FRONTEND
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"
    const rol = localStorage.getItem("rol") || "USER"
    const esPremium = suscripcion === "ACTIVO" || rol === "ADMIN"
    const limiteAlcanzado = !esPremium && cuadernos.length >= 2

    useEffect(() => {
        cargarCuadernos()
    }, [])

    const cargarCuadernos = async () => {
        try {
            const res = await axios.get("https://api.vix-flow.com/api/cuadernos", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCuadernos(res.data)
        } catch (error) {
            console.error("Error al cargar cuadernos:", error)
        }
    }

    const intentarCrearCuaderno = () => {
        if (limiteAlcanzado) {
            alert("Has alcanzado el límite de 2 cuadernos gratuitos. ¡Mejora a Premium para crear cuadernos ilimitados!")
            navigate("/plan") // Redirige a tu página de pagos/planes
            return
        }
        setModalAbierto(true)
    }

    const guardarCuaderno = async (e) => {
        e.preventDefault()
        if (!nuevoNombre.trim()) {
            setError("El nombre del cuaderno es obligatorio")
            return
        }

        try {
            await axios.post("https://api.vix-flow.com/api/cuadernos", 
                { nombre: nuevoNombre, descripcion: nuevaDescripcion },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setModalAbierto(false)
            setNuevoNombre("")
            setNuevaDescripcion("")
            setError("")
            cargarCuadernos() // Recargar la lista
        } catch (error) {
            console.error("Error al crear:", error)
            setError(error.response?.data || "Ocurrió un error al crear el cuaderno")
        }
    }

    const eliminarCuaderno = async (id, e) => {
        e.stopPropagation() // Evita que al hacer clic en eliminar, se abra el cuaderno
        if (!window.confirm("¿Estás seguro de eliminar este cuaderno y todas sus hojas?")) return

        try {
            await axios.delete(`https://api.vix-flow.com/api/cuadernos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            cargarCuadernos()
        } catch (error) {
            console.error("Error al eliminar:", error)
        }
    }

    return (
        <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300 pb-10`}>
            <Navbar />

            <div className="max-w-7xl mx-auto w-full p-6 mt-6">
                
                {/* ── HEADER DE LA PÁGINA ── */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Mis Cuadernos</h1>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                            {esPremium ? "✨ Tienes cuadernos ilimitados" : `Plan Gratuito: ${cuadernos.length} / 2 cuadernos utilizados`}
                        </p>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={intentarCrearCuaderno}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
                            limiteAlcanzado 
                                ? "bg-gray-800 text-gray-400 border border-dashed border-gray-600 cursor-not-allowed hover:bg-gray-700" 
                                : "bg-cyan-500 hover:bg-cyan-400 text-gray-950"
                        }`}
                    >
                        {limiteAlcanzado ? "🔒 Límite Alcanzado" : "➕ Nuevo Cuaderno"}
                    </motion.button>
                </div>

                {/* ── GRILLA DE CUADERNOS ── */}
                {cuadernos.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
                        <span className="text-6xl mb-4 block">📓</span>
                        <h2 className="text-xl font-bold mb-2">Aún no tienes cuadernos</h2>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Crea tu primer cuaderno para empezar a tomar notas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cuadernos.map((cuaderno) => (
                            <motion.div
                                key={cuaderno.id}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/cuadernos/${cuaderno.id}`)}
                                className={`cursor-pointer relative overflow-hidden rounded-2xl p-6 border transition-all h-48 flex flex-col justify-between shadow-sm hover:shadow-md
                                    ${darkMode 
                                        ? 'bg-gray-900 border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800' 
                                        : 'bg-white border-gray-200 hover:border-cyan-500/50'}`}
                            >
                                {/* Pestaña decorativa simulando un cuaderno real */}
                                <div className="absolute top-0 right-6 w-8 h-3 bg-cyan-500 rounded-b-md opacity-80"></div>

                                <div>
                                    <h3 className="text-xl font-bold truncate pr-4" title={cuaderno.nombre}>
                                        {cuaderno.nombre}
                                    </h3>
                                    <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {cuaderno.descripcion || "Sin descripción"}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-500/20">
                                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {new Date(cuaderno.fechaCreacion).toLocaleDateString()}
                                    </span>
                                    
                                    <button 
                                        onClick={(e) => eliminarCuaderno(cuaderno.id, e)}
                                        className="text-red-500 hover:text-red-400 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ── MODAL NUEVO CUADERNO ── */}
                {modalAbierto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            key={cuaderno.id}
                            whileHover={{ y: -5 }}
                            className={`group cursor-pointer relative overflow-hidden rounded-2xl border transition-all h-48 flex flex-col justify-between shadow-sm hover:shadow-md
                                ${darkMode 
                                    ? 'bg-gray-900 border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800' 
                                    : 'bg-white border-gray-200 hover:border-cyan-500/50'}`}
                        >
                            {/* Foto de portada del cuaderno */}
                            {cuaderno.fotoCuaderno ? (
                                <div 
                                    className="absolute inset-0 bg-cover bg-center opacity-20"
                                    style={{ backgroundImage: `url(${cuaderno.fotoCuaderno})` }}
                                />
                            ) : null}

                            {/* Botón cambiar foto - solo premium */}
                            {esPremium && (
                                <label className="absolute top-2 right-2 z-10 cursor-pointer bg-black/40 hover:bg-black/60 text-white rounded-lg p-1.5 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100">
                                    <span className="text-xs">🖼️</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0]
                                            if (!file) return
                                            const reader = new FileReader()
                                            reader.onloadend = async () => {
                                                const img = new Image()
                                                img.onload = async () => {
                                                    const canvas = document.createElement('canvas')
                                                    canvas.width = 400
                                                    canvas.height = 200
                                                    canvas.getContext('2d').drawImage(img, 0, 0, 400, 200)
                                                    const compressed = canvas.toDataURL('image/jpeg', 0.7)
                                                    try {
                                                        await axios.patch(
                                                            `https://api.vix-flow.com/api/cuadernos/${cuaderno.id}/foto`,
                                                            { fotoCuaderno: compressed },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        )
                                                        cargarCuadernos()
                                                    } catch (error) {
                                                        console.error("Error guardando foto:", error)
                                                    }
                                                }
                                                img.src = reader.result
                                            }
                                            reader.readAsDataURL(file)
                                        }}
                                    />
                                </label>
                            )}

                            <div className="relative z-10 p-6">
                                {/* Pestaña decorativa */}
                                <div className="absolute top-0 right-6 w-8 h-3 bg-cyan-500 rounded-b-md opacity-80"></div>

                                <h3 className="text-xl font-bold truncate pr-4 mt-2" title={cuaderno.nombre}>
                                    {cuaderno.nombre}
                                </h3>
                                <p className={`text-sm mt-2 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {cuaderno.descripcion || "Sin descripción"}
                                </p>
                            </div>

                            <div className="relative z-10 px-6 pb-4 flex justify-between items-center mt-4 pt-4 border-t border-gray-500/20">
                                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {new Date(cuaderno.fechaCreacion).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={(e) => eliminarCuaderno(cuaderno.id, e)}
                                    className="text-red-500 hover:text-red-400 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Cuadernos