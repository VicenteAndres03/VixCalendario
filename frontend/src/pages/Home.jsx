import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

function Home(){
    const navigate = useNavigate()

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
            emoji: "📊",
            titulo: "Métricas de Enfoque",
            descripcion: "Analiza tu productividad real. Descubre en qué inviertes tu tiempo cada día."
        },
        {
            emoji: "📄",
            titulo: "Reportes PDF",
            descripcion: "Genera informes profesionales de tu trabajo mensual con un solo botón."
        },
        {
            emoji: "🔗",
            titulo: "Portal de Clientes",
            descripcion: "Comparte tu progreso con clientes mediante un link seguro. Sin que necesiten cuenta."
        }
    ]

    const planes = [
        {
            nombre: "Gratuito",
            precio: "$0",
            periodo: "para siempre",
            color: "border-gray-700",
            botonColor: "bg-gray-700 hover:bg-gray-600 text-white",
            caracteristicas: [
                "✅ Calendario personal",
                "✅ Tablero Kanban básico",
                "✅ Tareas ilimitadas",
                "✅ Vista mes, semana y día",
                "❌ Proyectos colaborativos",
                "❌ Reportes PDF",
                "❌ Portal de clientes",
                "❌ Métricas de enfoque",
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
                "✅ Proyectos colaborativos",
                "✅ Reportes PDF automáticos",
                "✅ Portal de clientes",
                "✅ Métricas de enfoque",
                "✅ 1 mes gratis al registrarte",
                "✅ Soporte prioritario",
                "✅ Actualizaciones anticipadas",
            ]
        }
    ]

    return (
        <div className="bg-gray-950 min-h-screen overflow-hidden">

            {/* Efectos de fondo */}
            <div className="fixed w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl top-0 left-0 pointer-events-none"></div>
            <div className="fixed w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl bottom-0 right-0 pointer-events-none"></div>

            {/* Navbar del Home */}
            <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <span className="text-2xl">📅</span>
                    <span className="text-xl font-bold text-cyan-400">Vix-Flow</span>
                </motion.div>

                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate("/login")}
                        className="text-gray-400 hover:text-white transition-colors"
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

            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center px-6 py-24 relative">
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
                    className="text-6xl md:text-7xl font-bold text-white mb-6"
                >
                    Organiza tu vida con{" "}
                    <span className="text-cyan-400">Vix-Flow</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-gray-400 text-xl max-w-2xl mb-10"
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
                        className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg transition-all"
                    >
                        Iniciar Sesión
                    </motion.button>
                </motion.div>
            </section>

            {/* Características */}
            <section className="px-6 py-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-white text-center mb-4"
                >
                    Todo lo que necesitas
                </motion.h2>
                <p className="text-gray-400 text-center mb-12 text-lg">
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
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer transition-all duration-300"
                        >
                            <span className="text-4xl mb-4 block">{item.emoji}</span>
                            <h3 className="text-white font-bold text-lg mb-2">{item.titulo}</h3>
                            <p className="text-gray-400 text-sm">{item.descripcion}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Planes */}
            <section className="px-6 py-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-bold text-white text-center mb-4"
                >
                    Planes simples y transparentes
                </motion.h2>
                <p className="text-gray-400 text-center mb-12 text-lg">
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
                            className={`flex-1 bg-gray-900 border-2 ${plan.color} rounded-2xl p-8 relative`}
                        >
                            {plan.destacado && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-gray-950 font-bold px-4 py-1 rounded-full text-sm">
                                    ⭐ Recomendado
                                </div>
                            )}

                            <h3 className="text-white font-bold text-2xl mb-2">{plan.nombre}</h3>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-5xl font-bold text-cyan-400">{plan.precio}</span>
                                <span className="text-gray-400 mb-2">/{plan.periodo}</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.caracteristicas.map((c, i) => (
                                    <li key={i} className="text-gray-300 text-sm">{c}</li>
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

            {/* Footer */}
            <footer className="border-t border-gray-800 px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <span className="text-cyan-400 font-bold">Vix-Flow</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © 2026 Vix-Flow. Desarrollado por vixdeev 🚀
                    </p>
                    <div className="flex gap-4 text-gray-400 text-sm">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Términos</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home