import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";

function Nosotros() {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    // Efecto para que la página siempre cargue desde arriba
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const valores = [
        {
            icono: "🎯",
            titulo: "Enfoque Absoluto",
            desc: "Creemos en la productividad sin distracciones. Vix-Flow está diseñado para que te concentres en lo que realmente importa."
        },
        {
            icono: "🤝",
            titulo: "Colaboración",
            desc: "Los grandes proyectos no se hacen solos. Facilitamos el trabajo en equipo con sincronización en tiempo real."
        },
        {
            icono: "⚡",
            titulo: "Simplicidad",
            desc: "La mejor herramienta es la que no requiere manual. Combinamos Kanban y Calendario en una interfaz intuitiva."
        }
    ];

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
            {/* Mostrar Navbar si está logueado, botón si no lo está */}
            {localStorage.getItem("token") ? (
                <Navbar />
            ) : (
                <div className={`p-6 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${darkMode ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-500"}`}
                    >
                        <span>←</span> Volver atrás
                    </button>
                </div>
            )}

            <main className="flex-grow max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Acerca de <span className="text-cyan-400">Vix-Flow</span>
                    </h1>
                    <p className={`text-lg md:text-xl max-w-3xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Nacimos con una misión simple: terminar con el caos de usar cinco aplicaciones diferentes 
                        para organizar tu vida. Aquí, tu calendario y tus tableros trabajan como uno solo.
                    </p>
                </motion.div>

                {/* Sección de Valores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {valores.map((valor, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border text-center ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100 shadow-xl"}`}
                        >
                            <div className="text-5xl mb-4">{valor.icono}</div>
                            <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{valor.titulo}</h3>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{valor.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Sección del Creador */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`rounded-3xl p-8 md:p-12 border flex flex-col md:flex-row items-center gap-8 ${darkMode ? "bg-gray-900/50 border-cyan-500/20" : "bg-cyan-50 border-cyan-100"}`}
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-6xl shadow-lg">
                        🚀
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Desarrollado por <span className="text-cyan-500">vixdeev</span>
                        </h2>
                        <p className={`mb-4 leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Vix-Flow comenzó como un proyecto personal para resolver mis propios problemas de productividad. 
                            Me di cuenta de que las herramientas actuales eran demasiado complejas o demasiado simples. 
                            Así que decidí construir exactamente lo que necesitaba, usando las mejores tecnologías para crear una experiencia fluida, rápida y hermosa.
                        </p>
                        <a 
                            href="https://github.com" 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-medium transition-colors"
                        >
                            Conoce más sobre mi trabajo →
                        </a>
                    </div>
                </motion.div>
            </main>
            
            {/* OJO: NO importamos el Footer aquí porque ya está global en el App.jsx */}
        </div>
    );
}

export default Nosotros;