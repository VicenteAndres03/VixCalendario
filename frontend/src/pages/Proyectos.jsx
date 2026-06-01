import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function Proyectos() {
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")

    const [proyectos, setProyectos] = useState([])
    const [amigos, setAmigos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [mostrarInvitar, setMostrarInvitar] = useState(false)
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
    const [emailInvitado, setEmailInvitado] = useState("")
    const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" })
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    const emailUsuario = localStorage.getItem("email")

    // 🔥 NUEVO ESTADO PARA EL MODAL DE CONFIRMACIÓN 🔥
    const [modalConfirmacion, setModalConfirmacion] = useState({ visible: false, idProyecto: null })

    useEffect(() => {
        cargarProyectos()
        cargarAmigos()
    }, [])

    const cargarProyectos = async () => {
        try {
            const response = await axios.get("https://api.vix-flow.com/api/proyectos/mis", {
                headers: { Authorization: `Bearer ${token}` }
            })
            const proyectosData = response.data;

            const proyectosConProgreso = await Promise.all(
                proyectosData.map(async (proy) => {
                    try {
                        const resProgreso = await axios.get(`https://api.vix-flow.com/api/proyectos/progreso/${proy.proyecto.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        return { ...proy, progreso: resProgreso.data };
                    } catch (error) {
                        return { ...proy, progreso: 0 };
                    }
                })
            );

            setProyectos(proyectosConProgreso)
        } catch (error) {
            console.error("Error al cargar proyectos:", error)
        } finally {
            setCargando(false)
        }
    }

    const cargarAmigos = async () => {
        try {
            const response = await axios.get("https://api.vix-flow.com/api/amigos/lista", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAmigos(response.data)
        } catch (error) {
            console.error("Error al cargar amigos:", error)
        }
    }

    const crearProyecto = async () => {
        if (!nuevoProyecto.nombre) return
        try {
            await axios.post("https://api.vix-flow.com/api/proyectos/crear", nuevoProyecto, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMostrarModal(false)
            setNuevoProyecto({ nombre: "", descripcion: "" })
            setMensaje({ tipo: "exito", texto: "Proyecto creado correctamente" })
            cargarProyectos()
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Error al crear el proyecto" })
        }
    }

    const invitarAmigo = async () => {
        if (!emailInvitado || !proyectoSeleccionado) return
        try {
            await axios.post(
                `https://api.vix-flow.com/api/proyectos/invitar/${proyectoSeleccionado.proyecto.id}?emailInvitado=${emailInvitado}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMensaje({ tipo: "exito", texto: "Amigo invitado correctamente" })
            setMostrarInvitar(false)
            setEmailInvitado("")
        } catch (error) {
            setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "Error al invitar" })
        }
    }

    // 🔥 NUEVA LÓGICA DE ELIMINACIÓN CUSTOM 🔥
    const intentarEliminar = (proyectoId) => {
        setModalConfirmacion({ visible: true, idProyecto: proyectoId })
    }

    const confirmarEliminacion = async () => {
        try {
            await axios.delete(`https://api.vix-flow.com/api/proyectos/eliminar/${modalConfirmacion.idProyecto}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMensaje({ tipo: "exito", texto: "Proyecto eliminado exitosamente" })
            cargarProyectos()
            setModalConfirmacion({ visible: false, idProyecto: null }) 
        } catch (error) {
            setMensaje({ tipo: "error", texto: error.response?.data?.mensaje || "Error al eliminar el proyecto" })
            setModalConfirmacion({ visible: false, idProyecto: null })
        }
    }

    const colores = [
        "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
        "from-purple-500/20 to-purple-500/5 border-purple-500/30",
        "from-green-500/20 to-green-500/5 border-green-500/30",
        "from-orange-500/20 to-orange-500/5 border-orange-500/30",
        "from-pink-500/20 to-pink-500/5 border-pink-500/30",
    ]

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {darkMode && (
                <>
                    <div className="fixed w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none"></div>
                    <div className="fixed w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none"></div>
                </>
            )}

            <div className="p-6 max-w-7xl mx-auto relative z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Mis Proyectos</h1>
                        <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                            Colabora con tu equipo en proyectos compartidos
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMostrarModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Nuevo Proyecto
                    </motion.button>
                </div>

                {/* Mensaje */}
                <AnimatePresence>
                    {mensaje.texto && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                                mensaje.tipo === "exito"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                        >
                            {mensaje.texto}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid proyectos */}
                {cargando ? (
                    <div className="text-center text-gray-400 mt-20">Cargando proyectos...</div>
                ) : proyectos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-center">
                        <div className="text-8xl mb-4 opacity-30">🚀</div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No tienes proyectos aún</h3>
                        <p className="text-gray-500 text-sm">Crea tu primer proyecto y empieza a colaborar</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proyectos.map((proy, index) => (
                            <motion.div
                                key={proy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className={`bg-gradient-to-b ${colores[index % colores.length]} border rounded-2xl p-6 flex flex-col justify-between`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-xl">
                                            🚀
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                proy.rol === "ADMIN"
                                                    ? "bg-cyan-500/20 text-cyan-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                            }`}>
                                                {proy.rol === "ADMIN" ? "Admin" : "Miembro"}
                                            </span>
                                            {/* Botón de eliminar (solo visible para ADMIN) */}
                                            {proy.rol === "ADMIN" && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        intentarEliminar(proy.proyecto.id);
                                                    }}
                                                    className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                                    title="Eliminar proyecto"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg mb-2 text-white">
                                        {proy.proyecto?.nombre}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        {proy.proyecto?.descripcion || "Sin descripción"}
                                    </p>
                                </div>

                                <div>
                                    {/* Barra de Progreso */}
                                    <div className="mb-5">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1 font-medium">
                                            <span>Progreso del proyecto</span>
                                            <span>{proy.progreso || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800/60 rounded-full h-1.5">
                                            <div
                                                className="bg-cyan-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${proy.progreso || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setProyectoSeleccionado(proy)
                                                setMostrarInvitar(true)
                                            }}
                                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium py-2 rounded-xl transition-all"
                                        >
                                            👥 Invitar
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/proyecto/${proy.proyecto.id}/tablero`)}
                                            className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-medium py-2 rounded-xl transition-all"
                                        >
                                            📋 Ver Tablero
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔥 NUEVO MODAL DE CONFIRMACIÓN 🔥 */}
            <AnimatePresence>
                {modalConfirmacion.visible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setModalConfirmacion({ visible: false, idProyecto: null })}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className={`border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl ${darkMode ? "bg-gray-900 border-red-500/30" : "bg-white border-red-200"}`}>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 text-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                ⚠️
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Eliminar Proyecto</h2>
                            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                ¿Estás seguro de que deseas eliminar este proyecto de forma permanente? Esta acción borrará todas las tareas y no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setModalConfirmacion({ visible: false, idProyecto: null })} className={`w-1/2 py-3 rounded-xl font-medium transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
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

            {/* Modal Nuevo Proyecto */}
            <AnimatePresence>
                {mostrarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setMostrarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Nuevo Proyecto</h2>

                            <div className="mb-4">
                                <label className="text-gray-400 text-sm mb-1 block">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del proyecto"
                                    value={nuevoProyecto.nombre}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
                                <textarea
                                    placeholder="Descripción del proyecto"
                                    value={nuevoProyecto.descripcion}
                                    onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMostrarModal(false)}
                                    className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={crearProyecto}
                                    className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all"
                                >
                                    Crear
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Invitar Amigo */}
            <AnimatePresence>
                {mostrarInvitar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setMostrarInvitar(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Invitar al Proyecto</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Proyecto: <span className="text-white font-medium">{proyectoSeleccionado?.proyecto?.nombre}</span>
                            </p>

                            <div className="mb-4">
                                <label className="text-gray-400 text-sm mb-2 block">Selecciona un amigo</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {amigos.map((amigo) => {
                                        const esSolicitante = amigo.solicitante?.email === emailUsuario
                                        const datosAmigo = esSolicitante ? amigo.receptor : amigo.solicitante
                                        return (
                                            <div
                                                key={amigo.id}
                                                onClick={() => setEmailInvitado(datosAmigo?.email)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                                    emailInvitado === datosAmigo?.email
                                                        ? "border-cyan-500 bg-cyan-500/10"
                                                        : "border-gray-700 hover:border-gray-600 bg-gray-800"
                                                }`}
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {datosAmigo?.nombre?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{datosAmigo?.nombre}</p>
                                                    <p className="text-gray-400 text-xs">{datosAmigo?.email}</p>
                                                </div>
                                                {emailInvitado === datosAmigo?.email && (
                                                    <span className="ml-auto text-cyan-400">✓</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {amigos.length === 0 && (
                                        <p className="text-gray-500 text-sm text-center py-4">
                                            No tienes amigos agregados aún
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMostrarInvitar(false)}
                                    className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={invitarAmigo}
                                    disabled={!emailInvitado}
                                    className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                                >
                                    Invitar
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Proyectos