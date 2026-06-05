import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"

function Cuadernos() {
    const [cuadernos, setCuadernos] = useState([])
    const [modalAbierto, setModalAbierto] = useState(false)
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevaDescripcion, setNuevaDescripcion] = useState("")
    const [error, setError] = useState("")
    const [cuadernoOpciones, setCuadernoOpciones] = useState(null) // { id, nombre, fotoCuaderno }

    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    
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
            alert("Has alcanzado el límite de 2 cuadernos gratuitos. ¡Mejora a Premium!")
            navigate("/plan")
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
            cargarCuadernos()
        } catch (error) {
            setError(error.response?.data || "Ocurrió un error al crear el cuaderno")
        }
    }

    const eliminarCuaderno = async (id, e) => {
        e.stopPropagation()
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

    const cambiarFotoCuaderno = async (id, e) => {
        e.stopPropagation()
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
                        `https://api.vix-flow.com/api/cuadernos/${id}/foto`,
                        { fotoCuaderno: compressed },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    // Actualizar el estado local inmediatamente sin esperar al servidor
                    setCuadernos(prev => prev.map(c =>
                        c.id === id ? { ...c, fotoCuaderno: compressed } : c
                    ))
                    // Si el modal de opciones está abierto para este cuaderno, actualizar su dato
                    setCuadernoOpciones(prev =>
                        prev && prev.id === id ? { ...prev, fotoCuaderno: compressed } : prev
                    )
                } catch (error) {
                    console.error("Error guardando foto:", error)
                    alert("No se pudo guardar la foto de portada. Inténtalo de nuevo.")
                }
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    }

    const descargarPdfCuaderno = async (id, nombre, e) => {
        e.stopPropagation()
        try {
            const res = await axios.get(
                `https://api.vix-flow.com/api/reportes/cuaderno/${id}`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            )
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Cuaderno_${nombre}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error descargando PDF:", error)
            alert("Error al generar el PDF")
        }
    }

    return (
        <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300 pb-10`}>
            <Navbar />

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 mt-4 sm:mt-6">
                
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
                                ? "bg-gray-800 text-gray-400 border border-dashed border-gray-600 cursor-not-allowed" 
                                : "bg-cyan-500 hover:bg-cyan-400 text-gray-950"
                        }`}
                    >
                        {limiteAlcanzado ? "🔒 Límite Alcanzado" : "➕ Nuevo Cuaderno"}
                    </motion.button>
                </div>

                {cuadernos.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
                        <span className="text-6xl mb-4 block">📓</span>
                        <h2 className="text-xl font-bold mb-2">Aún no tienes cuadernos</h2>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Crea tu primer cuaderno para empezar a tomar notas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {cuadernos.map((cuaderno) => (
                            <motion.div
                                key={cuaderno.id}
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCuadernoOpciones(cuaderno)}
                                className="group cursor-pointer relative flex flex-col"
                                style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))" }}
                            >
                                {/* Lomo del cuaderno */}
                                <div className="absolute left-0 top-0 bottom-[28px] w-5 rounded-l-lg z-10 flex flex-col justify-center items-center gap-1"
                                    style={{ background: "linear-gradient(to right, #0e7490, #06b6d4)" }}>
                                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                                </div>

                                {/* Cuerpo del cuaderno */}
                                <div className={`ml-4 rounded-r-xl rounded-tl-sm overflow-hidden flex flex-col flex-1 border-t border-r border-b transition-all
                                    ${darkMode ? 'border-gray-700 group-hover:border-cyan-500/60' : 'border-gray-300 group-hover:border-cyan-400/70'}`}
                                    style={{ minHeight: "220px" }}
                                >
                                    {/* Zona imagen / portada */}
                                    <div className="relative flex-1 overflow-hidden" style={{ minHeight: "150px" }}>
                                        {cuaderno.fotoCuaderno ? (
                                            <img
                                                src={cuaderno.fotoCuaderno}
                                                alt={cuaderno.nombre}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                style={{ minHeight: "150px" }}
                                            />
                                        ) : (
                                            <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                                                style={{ minHeight: "150px" }}>
                                                {/* Líneas de papel decorativas */}
                                                <div className="w-full px-4 flex flex-col gap-2 opacity-30">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`h-px w-full ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                                                    ))}
                                                </div>
                                                <span className="text-3xl absolute">📓</span>
                                            </div>
                                        )}
                                        {/* Gradiente inferior sobre la imagen */}
                                        {cuaderno.fotoCuaderno && (
                                            <div className="absolute inset-x-0 bottom-0 h-16"
                                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
                                            />
                                        )}
                                    </div>

                                    {/* Pie del cuaderno: título + eliminar */}
                                    <div className={`px-3 py-2.5 flex items-center justify-between gap-2 border-t
                                        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <span className={`text-sm font-bold truncate leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                            title={cuaderno.nombre}>
                                            {cuaderno.nombre}
                                        </span>
                                        <button
                                            onClick={(e) => eliminarCuaderno(cuaderno.id, e)}
                                            className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg p-1 transition-all opacity-0 group-hover:opacity-100"
                                            title="Eliminar cuaderno"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal opciones cuaderno */}
                <AnimatePresence>
                    {cuadernoOpciones && (
                        <div 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setCuadernoOpciones(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
                            >
                                {/* Miniatura portada */}
                                {cuadernoOpciones.fotoCuaderno && (
                                    <div 
                                        className="w-full h-24 rounded-xl mb-4 bg-cover bg-center opacity-80"
                                        style={{ backgroundImage: `url(${cuadernoOpciones.fotoCuaderno})` }}
                                    />
                                )}
                                {!cuadernoOpciones.fotoCuaderno && (
                                    <div className={`w-full h-20 rounded-xl mb-4 flex items-center justify-center text-4xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        📓
                                    </div>
                                )}

                                <h2 className="text-lg font-bold mb-1 truncate">{cuadernoOpciones.nombre}</h2>
                                <p className={`text-xs mb-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    ¿Qué quieres hacer?
                                </p>

                                <div className="flex flex-col gap-3">
                                    {/* Ir al cuaderno */}
                                    <button
                                        onClick={() => navigate(`/cuadernos/${cuadernoOpciones.id}`)}
                                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        📖 Abrir cuaderno
                                    </button>

                                    {/* Foto de portada - solo premium */}
                                    {esPremium ? (
                                        <label
                                            onClick={e => e.stopPropagation()}
                                            className={`w-full cursor-pointer font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border ${
                                                darkMode 
                                                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' 
                                                    : 'border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100'
                                            }`}
                                        >
                                            🖼️ Cambiar foto de portada
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden"
                                                onChange={(e) => {
                                                    cambiarFotoCuaderno(cuadernoOpciones.id, e)
                                                }}
                                            />
                                        </label>
                                    ) : (
                                        <button
                                            onClick={() => { setCuadernoOpciones(null); navigate("/plan") }}
                                            className={`w-full font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-dashed ${
                                                darkMode 
                                                    ? 'border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-500 hover:text-gray-400' 
                                                    : 'border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400'
                                            }`}
                                        >
                                            🔒 Foto de portada <span className="text-xs font-normal">(Premium)</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setCuadernoOpciones(null)}
                                        className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Modal nuevo cuaderno */}
                <AnimatePresence>
                    {modalAbierto && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
                            >
                                <h2 className="text-2xl font-bold mb-4">Crear Cuaderno</h2>
                                
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={guardarCuaderno}>
                                    <div className="mb-4">
                                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Nombre del Cuaderno
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength={50}
                                            value={nuevoNombre}
                                            onChange={(e) => setNuevoNombre(e.target.value)}
                                            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                                                darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                            }`}
                                            placeholder="Ej: Apuntes de la U..."
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Descripción (Opcional)
                                        </label>
                                        <textarea 
                                            maxLength={150}
                                            value={nuevaDescripcion}
                                            onChange={(e) => setNuevaDescripcion(e.target.value)}
                                            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none h-24 ${
                                                darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                            }`}
                                            placeholder="¿De qué trata este cuaderno?"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setModalAbierto(false)}
                                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2 rounded-xl transition-all"
                                        >
                                            Crear
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Cuadernos