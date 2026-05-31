import { useContext } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../context/ThemeContext"
import Footer from "../components/Footer"

function Home(){
    const navigate = useNavigate()
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    // 🔥 CARACTERÍSTICAS ACTUALIZADAS CON LO QUE REALMENTE HACE LA APP 🔥
    const caracteristicas = [
        {
            emoji: "📅",
            titulo: "Calendario Inteligente",
            descripcion: "Organiza tu día con vista por mes, semana o día. Visualiza todas tus tareas de un vistazo."
        },
        {
            emoji: "🗂️",
            titulo: "Tablero Kanban",
            descripcion: "Gestiona tus tareas al estilo Trello. Mueve tarjetas entre columnas con un solo click."
        },
        {
            emoji: "👥",
            titulo: "Proyectos Colaborativos",
            descripcion: "Invita amigos a tus proyectos, asigna tareas y trabaja en equipo en tiempo real."
        },
        {
            emoji: "🌱",
            titulo: "Hábitos y Gamificación",
            descripcion: "Mantén tus rachas diarias, desbloquea logros, medallas y temas visuales exclusivos."
        },
        {
            emoji: "📊",
            titulo: "Métricas y Focus",
            descripcion: "Analiza tu productividad con estadísticas y usa el Temporizador Pomodoro integrado."
        },
        {
            emoji: "🔗",
            titulo: "Portal y Reportes",
            descripcion: "Exporta tus avances a PDF o compártelos con clientes mediante un link público seguro."
        }
    ]

    // 🔥 PLANES ACTUALIZADOS SEGÚN EL NAVBAR Y LOS PERMISOS REALES 🔥
    const planes = [
        {
            nombre: "Gratuito",
            precio: "$0",
            periodo: "para siempre",
            color: darkMode ? "border-gray-700" : "border-gray-200",
            botonColor: darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800",
            caracteristicas: [
                "✅ Calendario y Tablero Kanban",
                "✅ Tareas y Proyectos Ilimitados",
                "✅ Sistema de Amigos",
                "❌ Seguimiento de Hábitos",
                "❌ Métricas de Productividad",
                "❌ Temporizador Pomodoro",
                "❌ Exportar a PDF",
                "❌ Portal Link para Clientes",
            ]
        },
        {
            nombre: "Premium",
            precio: "$3",
            periodo: "por mes",
            color: "border-cyan-500",
            botonColor: "bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold",
            destacado: true,
            caracteristicas: [
                "✅ Todo lo del plan gratuito",
                "✅ Seguimiento de Hábitos 🌱",
                "✅ Métricas y Estadísticas 📊",
                "✅ Temporizador Pomodoro ⏱️",
                "✅ Gamificación y Temas 🏆",
                "✅ Exportación a PDF 📄",
                "✅ Link Público Clientes 🔗",
                "✅ 1 mes gratis de prueba 🎁",
            ]
        }
    ]

    return (
        <div className={`${darkMode ? "bg-gray-950" : "bg-gray-50"} min-h-screen overflow-hidden transition-colors duration-500 flex flex-col`}>

            {/* Efectos de fondo */}
            <div className="fixed w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl top-0 left-0 pointer-events-none z-0"></div>
            <div className="fixed w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl bottom-0 right-0 pointer-events-none z-0"></div>

            {/* Navbar del Home */}
            <nav className={`flex items-center justify-between px-8 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"} transition-colors duration-500 relative z-10`}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <span className="text-2xl">📅</span>
                    <span className="text-xl font-bold text-cyan-400">Vix-Flow</span>
                </motion.div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDarkMode(!darkMode)}
                        className={`text-xl mr-2 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}
                        title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate("/login")}
                        className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
                    >
                        Iniciar Sesión
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/registro")}
                        className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-4 py-2 rounded-xl transition-all"
                    >
                        Registrarse
                    </motion.button>
                </div>
            </nav>

            <main className="flex-grow">
                {/* Hero */}
                <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative z-10">
                    <motion.div
                        animate={{ rotate: 360, y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="text-8xl mb-8"
                    >
                        📅
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`text-6xl md:text-7xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"} transition-colors duration-500`}
                    >
                        Organiza tu vida con{" "}
                        <span className="text-cyan-400">Vix-Flow</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`text-xl max-w-2xl mb-10 ${darkMode ? "text-gray-400" : "text-gray-600"} transition-colors duration-500`}
                    >
                        La herramienta que une tu calendario y tus tableros en un solo lugar. 
                        Planifica, colabora y mide tu productividad real.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex gap-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/registro")}
                            className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-8 py-4 rounded-xl text-lg transition-all"
                        >
                            Empezar Gratis 🚀
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/login")}
                            className={`${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-900 shadow-sm"} px-8 py-4 rounded-xl text-lg transition-all`}
                        >
                            Iniciar Sesión
                        </motion.button>
                    </motion.div>
                </section>

                {/* Características */}
                <section className="px-6 py-20 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-4xl font-bold text-center mb-4 ${darkMode ? "text-white" : "text-gray-900"} transition-colors duration-500`}
                    >
                        Todo lo que necesitas
                    </motion.h2>
                    <p className={`text-center mb-12 text-lg ${darkMode ? "text-gray-400" : "text-gray-600"} transition-colors duration-500`}>
                        Una sola herramienta para gestionar tu tiempo y proyectos
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {caracteristicas.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.03, borderColor: "rgba(6,182,212,0.5)" }}
                                className={`${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-lg"} border rounded-2xl p-6 cursor-pointer transition-all duration-300`}
                            >
                                <span className="text-4xl mb-4 block">{item.emoji}</span>
                                <h3 className={`font-bold text-lg mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{item.titulo}</h3>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.descripcion}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Planes */}
                <section className="px-6 py-20 relative z-10 mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`text-4xl font-bold text-center mb-4 ${darkMode ? "text-white" : "text-gray-900"} transition-colors duration-500`}
                    >
                        Planes simples y transparentes
                    </motion.h2>
                    <p className={`text-center mb-12 text-lg ${darkMode ? "text-gray-400" : "text-gray-600"} transition-colors duration-500`}>
                        Empieza gratis, escala cuando lo necesites
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
                        {planes.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                whileHover={{ scale: 1.02 }}
                                className={`flex-1 border-2 ${plan.color} rounded-2xl p-8 relative ${darkMode ? "bg-gray-900" : "bg-white shadow-xl"} transition-colors duration-300`}
                            >
                                {plan.destacado && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-gray-950 font-bold px-4 py-1 rounded-full text-sm">
                                        ⭐ Recomendado
                                    </div>
                                )}

                                <h3 className={`font-bold text-2xl mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{plan.nombre}</h3>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-5xl font-bold text-cyan-400">{plan.precio}</span>
                                    <span className={`mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>/{plan.periodo}</span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.caracteristicas.map((c, i) => (
                                        <li key={i} className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{c}</li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/registro")}
                                    className={`w-full py-3 rounded-xl transition-all ${plan.botonColor}`}
                                >
                                    {plan.destacado ? "Empezar con 1 mes gratis" : "Empezar gratis"}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer mantenido como estaba */}
            
        </div>
    )
}

export default Home