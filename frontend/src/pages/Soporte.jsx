import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import { enviarMensajeSoporte } from "../services/authService" // 🔥 IMPORTAMOS LA FUNCIÓN 🔥

const FAQS = [
    { 
        pregunta: "¿Cómo puedo cambiar mi contraseña?", 
        respuesta: "Puedes hacerlo fácilmente desde la sección 'Mi Perfil', desplazándote hacia abajo hasta el apartado de Ajustes de Seguridad." 
    },
    { 
        pregunta: "¿Cómo invito amigos a mi proyecto?", 
        respuesta: "Primero debes enviarles una solicitud de amistad en la pestaña 'Amigos'. Una vez que acepten, ve a 'Proyectos', haz clic en 'Invitar' y selecciónalos de tu lista." 
    },
    { 
        pregunta: "¿Qué ventajas tiene el plan Premium?", 
        respuesta: "El plan Premium desbloquea el Seguimiento de Hábitos, Métricas de Productividad, Temporizador Pomodoro, Reportes en PDF y el Portal de Clientes." 
    },
]

function Soporte() {
    const { darkMode } = useContext(ThemeContext)
    const [cargando, setCargando] = useState(false)
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" })
    
    // Si el usuario está logueado, pre-llenamos sus datos
    const nombreGuardado = localStorage.getItem("nombre") || ""
    const emailGuardado = localStorage.getItem("email") || ""

    const [formData, setFormData] = useState({
        nombre: nombreGuardado,
        email: emailGuardado,
        asunto: "",
        mensaje: ""
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // 🔥 NUEVO HANDLESUBMIT CONECTADO AL BACKEND 🔥
    const handleSubmit = async (e) => {
        e.preventDefault()
        setCargando(true)
        setMensaje({ tipo: "", texto: "" })

        try {
            await enviarMensajeSoporte(formData)
            
            setMensaje({ tipo: "exito", texto: "¡Tu mensaje ha sido enviado con éxito! Nuestro equipo te contactará muy pronto." })
            setFormData({ ...formData, asunto: "", mensaje: "" }) // Limpiamos el asunto y mensaje
            
            // Ocultamos la alerta después de 5 segundos
            setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000)
        } catch (error) {
            setMensaje({ 
                tipo: "error", 
                texto: error.response?.data || "Hubo un problema al enviar el mensaje. Por favor, inténtalo más tarde." 
            })
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />

            {/* Efectos de fondo */}
            {darkMode && (
                <>
                    <div className="fixed w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl top-[10%] left-[-10%] pointer-events-none"></div>
                    <div className="fixed w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl bottom-[-10%] right-[-10%] pointer-events-none"></div>
                </>
            )}

            <div className="max-w-6xl mx-auto pt-10 px-6 pb-20 relative z-10">
                
                {/* Cabecera */}
                <div className="text-center mb-12">
                    <span className="text-5xl mb-4 block">👋</span>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Soporte y Contacto</h1>
                    <p className={`text-lg font-medium max-w-2xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ¿Tienes alguna duda, encontraste un error o quieres darnos una sugerencia? Estamos aquí para ayudarte a sacar el máximo provecho de la plataforma.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* COLUMNA IZQUIERDA: Formulario de Contacto */}
                    <div className="lg:col-span-7">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                            className={`p-8 rounded-3xl border shadow-xl ${darkMode ? "bg-gray-900/60 border-gray-800 backdrop-blur-md" : "bg-white border-gray-200"}`}
                        >
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span>✉️</span> Envíanos un mensaje
                            </h2>

                            <AnimatePresence>
                                {mensaje.texto && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className={`mb-6 p-4 rounded-xl text-sm font-bold text-center border ${
                                            mensaje.tipo === "error" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                                        }`}
                                    >
                                        {mensaje.texto}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre</label>
                                        <input 
                                            type="text" name="nombre" required
                                            value={formData.nombre} onChange={handleChange} 
                                            placeholder="Tu nombre" 
                                            className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-cyan-500 ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} 
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Correo Electrónico</label>
                                        <input 
                                            type="email" name="email" required
                                            value={formData.email} onChange={handleChange} 
                                            placeholder="ejemplo@correo.com" 
                                            className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-cyan-500 ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Asunto</label>
                                    <select 
                                        name="asunto" required
                                        value={formData.asunto} onChange={handleChange}
                                        className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900"}`}
                                    >
                                        <option value="" disabled className={darkMode ? "bg-gray-900" : ""}>Selecciona el motivo de tu contacto</option>
                                        <option value="Soporte Técnico" className={darkMode ? "bg-gray-900" : ""}>Soporte Técnico / Error en la app</option>
                                        <option value="Duda sobre Planes" className={darkMode ? "bg-gray-900" : ""}>Dudas sobre Planes Premium</option>
                                        <option value="Sugerencia" className={darkMode ? "bg-gray-900" : ""}>Sugerencia o Nueva Idea</option>
                                        <option value="Otro" className={darkMode ? "bg-gray-900" : ""}>Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mensaje</label>
                                    <textarea 
                                        name="mensaje" required rows={5}
                                        value={formData.mensaje} onChange={handleChange} 
                                        placeholder="Escribe aquí los detalles de tu consulta..." 
                                        className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-cyan-500 resize-none ${darkMode ? "bg-gray-950/50 border-gray-800 focus:border-cyan-500 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 focus:border-cyan-500 text-gray-900 placeholder-gray-400"}`} 
                                    />
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={cargando}
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-2 mt-2"
                                >
                                    {cargando ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        "Enviar Mensaje"
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* COLUMNA DERECHA: FAQs e Info */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* Tarjeta de Contacto Directo */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className={`p-8 rounded-3xl border ${darkMode ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" : "bg-white border-gray-200 shadow-lg"}`}
                        >
                            <h3 className="text-xl font-bold mb-6 tracking-tight">Información de Contacto</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center text-lg shrink-0">
                                        📧
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Correo de soporte</p>
                                        <p className="font-medium text-cyan-500">vixdeev@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg shrink-0">
                                        ⏱️
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Horario de atención</p>
                                        <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Lunes a Viernes<br/>09:00 - 18:00 hrs</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tarjeta de FAQs */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className={`p-8 rounded-3xl border ${darkMode ? "bg-gray-900/40 border-gray-800/80 backdrop-blur-md" : "bg-white border-gray-200 shadow-lg"}`}
                        >
                            <h3 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-2">
                                <span>💡</span> Preguntas Frecuentes
                            </h3>
                            <div className="space-y-5">
                                {FAQS.map((faq, index) => (
                                    <div key={index} className={`p-4 rounded-2xl border ${darkMode ? "bg-gray-950/50 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                                        <h4 className={`font-bold text-sm mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                            {faq.pregunta}
                                        </h4>
                                        <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            {faq.respuesta}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Soporte