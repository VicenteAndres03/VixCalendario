import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import axios from "axios"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"

function CuadernoDetalle() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"
    const rol = localStorage.getItem("rol") || "USER"
    const esPremium = suscripcion === "ACTIVO" || rol === "ADMIN"

    const [cuaderno, setCuaderno] = useState(null)
    const [hojas, setHojas] = useState([])
    const [hojaActiva, setHojaActiva] = useState(null)
    const [contenido, setContenido] = useState("")
    const [titulo, setTitulo] = useState("")
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState("")
    const [descargandoPdf, setDescargandoPdf] = useState(false)

    useEffect(() => {
        cargarCuaderno()
        cargarHojas()
    }, [id])

    const cargarCuaderno = async () => {
        try {
            const res = await axios.get(`https://api.vix-flow.com/api/cuadernos`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const encontrado = res.data.find(c => String(c.id) === String(id))
            setCuaderno(encontrado)
        } catch (error) {
            console.error("Error al cargar cuaderno:", error)
        }
    }

    const cargarHojas = async () => {
        try {
            const res = await axios.get(`https://api.vix-flow.com/api/hojas/cuaderno/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHojas(res.data)
            if (res.data.length > 0) {
                seleccionarHoja(res.data[0])
            }
        } catch (error) {
            console.error("Error al cargar hojas:", error)
        }
    }

    const seleccionarHoja = (hoja) => {
        setHojaActiva(hoja)
        setTitulo(hoja.titulo || "")
        setContenido(hoja.contenido || "")
        setError("")
    }

    const crearHoja = async () => {
        try {
            const res = await axios.post(
                `https://api.vix-flow.com/api/hojas/cuaderno/${id}`,
                { titulo: "Nueva hoja", contenido: "" },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Si el backend devuelve string de error (403 freemium)
            if (typeof res.data === "string") {
                setError(res.data)
                return
            }
            await cargarHojas()
            seleccionarHoja(res.data)
        } catch (error) {
            setError(error.response?.data || "Error al crear la hoja")
        }
    }

    const guardarHoja = async () => {
        if (!hojaActiva) return
        setGuardando(true)
        try {
            const res = await axios.put(
                `https://api.vix-flow.com/api/hojas/${hojaActiva.id}`,
                { titulo, contenido },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            // Actualizamos la hoja en la lista sin recargar todo
            setHojas(prev => prev.map(h => h.id === hojaActiva.id ? res.data : h))
            setHojaActiva(res.data)
        } catch (error) {
            console.error("Error al guardar:", error)
        } finally {
            setGuardando(false)
        }
    }

    const eliminarHoja = async (hojaId, e) => {
        e.stopPropagation()
        if (!window.confirm("¿Eliminar esta hoja?")) return
        try {
            await axios.delete(`https://api.vix-flow.com/api/hojas/${hojaId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const nuevasHojas = hojas.filter(h => h.id !== hojaId)
            setHojas(nuevasHojas)
            if (hojaActiva?.id === hojaId) {
                if (nuevasHojas.length > 0) {
                    seleccionarHoja(nuevasHojas[0])
                } else {
                    setHojaActiva(null)
                    setTitulo("")
                    setContenido("")
                }
            }
        } catch (error) {
            console.error("Error al eliminar hoja:", error)
        }
    }

    // Guardar con Ctrl+S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                guardarHoja()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [hojaActiva, titulo, contenido])

    const descargarPdf = async () => {
        if (!esPremium) {
            navigate("/plan")
            return
        }
        setDescargandoPdf(true)
        try {
            const res = await axios.get(
                `https://api.vix-flow.com/api/reportes/cuaderno/${id}`,
                { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
            )
            // Verificar que la respuesta sea realmente un PDF y no un error JSON
            const contentType = res.headers['content-type'] || ''
            if (!contentType.includes('application/pdf')) {
                // Si el server devolvió JSON de error dentro del blob, leerlo
                const text = await res.data.text()
                console.error("Respuesta inesperada del servidor:", text)
                setError("El servidor no pudo generar el PDF. Inténtalo de nuevo.")
                return
            }
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `Cuaderno_${cuaderno?.nombre || id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error al descargar PDF:", error)
            // Si el error tiene respuesta, puede ser 403 (no premium) o 500
            if (error.response?.status === 403) {
                navigate("/plan")
            } else {
                setError("Error al generar el PDF. Verifica tu conexión e inténtalo de nuevo.")
            }
        } finally {
            setDescargandoPdf(false)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6" style={{ height: "calc(100vh - 80px)" }}>

                {/* SIDEBAR */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-full md:w-64 h-1/3 md:h-full shrink-0 rounded-2xl border flex flex-col overflow-hidden ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                >
                    {/* Header */}
                    <div className={`p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                        <button
                            onClick={() => navigate("/cuadernos")}
                            className={`text-xs font-medium mb-3 flex items-center gap-1 transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                        >
                            ← Mis cuadernos
                        </button>
                        <h2 className="font-bold text-sm truncate">
                            📓 {cuaderno?.nombre || "Cuaderno"}
                        </h2>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {hojas.length} hoja{hojas.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Lista hojas */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {hojas.length === 0 ? (
                            <p className={`text-xs text-center py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                No hay hojas aún.<br />Crea la primera.
                            </p>
                        ) : (
                            hojas.map((hoja) => (
                                <div
                                    key={hoja.id}
                                    onClick={() => seleccionarHoja(hoja)}
                                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all ${
                                        hojaActiva?.id === hoja.id
                                            ? "bg-cyan-500/10 text-cyan-500"
                                            : darkMode
                                                ? "hover:bg-gray-800 text-gray-300"
                                                : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <span className="text-sm truncate flex items-center gap-2">
                                        📄 {hoja.titulo || "Sin título"}
                                    </span>
                                    <button
                                        onClick={(e) => eliminarHoja(hoja.id, e)}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity text-xs p-1 rounded"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Error freemium */}
                    {error && (
                        <div className="px-3 pb-2">
                            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Botón nueva hoja */}
                    <div className={`p-3 border-t flex flex-col gap-2 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                        {/* Botón PDF */}
                        <button
                            onClick={descargarPdf}
                            disabled={descargandoPdf}
                            className={`w-full font-bold py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border
                                ${esPremium
                                    ? (darkMode
                                        ? "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                        : "border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100")
                                    : "border-dashed border-gray-600 bg-gray-800/30 text-gray-500 hover:text-gray-400"
                                } disabled:opacity-50`}
                            title={esPremium ? "Exportar como PDF" : "Función exclusiva Premium"}
                        >
                            {descargandoPdf ? (
                                <span className="flex items-center gap-2">⏳ Generando...</span>
                            ) : (
                                <>
                                    {esPremium ? "📄" : "🔒"} Exportar PDF
                                    {!esPremium && <span className="text-xs font-normal">(Premium)</span>}
                                </>
                            )}
                        </button>

                        <button
                            onClick={crearHoja}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-2.5 rounded-xl text-sm transition-all"
                        >
                            + Nueva hoja
                        </button>
                    </div>
                </motion.div>

                {/* ÁREA DE ESCRITURA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex-1 h-2/3 md:h-full rounded-2xl border flex flex-col overflow-hidden ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                >
                    {hojaActiva ? (
                        <>
                            {/* Toolbar */}
                            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 border-b gap-3 sm:gap-0 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    className={`font-bold text-lg bg-transparent outline-none border-none w-full sm:flex-1 ${darkMode ? "text-white" : "text-gray-900"}`}
                                    placeholder="Título de la hoja..."
                                />
                                <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:ml-4">
                                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        Ctrl+S para guardar
                                    </span>
                                    <button
                                        onClick={guardarHoja}
                                        disabled={guardando}
                                        className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-5 py-1.5 rounded-xl text-sm transition-all disabled:opacity-50"
                                    >
                                        {guardando ? "Guardando..." : "Guardar"}
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <textarea
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                placeholder="Empieza a escribir aquí..."
                                className={`flex-1 resize-none p-4 sm:p-6 text-base outline-none bg-transparent leading-relaxed ${darkMode ? "text-gray-200 placeholder-gray-600" : "text-gray-800 placeholder-gray-400"}`}
                            />

                            {/* Footer info */}
                            <div className={`px-4 sm:px-6 py-2 border-t flex justify-end ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                                    {contenido.length} caracteres · {contenido.split(/\s+/).filter(Boolean).length} palabras
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <span className="text-6xl opacity-20">📄</span>
                            <p className={`text-sm font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                Selecciona una hoja o crea una nueva
                            </p>
                            <button
                                onClick={crearHoja}
                                className="mt-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
                            >
                                + Crear primera hoja
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default CuadernoDetalle