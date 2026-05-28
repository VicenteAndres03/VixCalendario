import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Cookies() {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
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

            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Política de Cookies
                    </h1>
                    <p className="mb-12 text-sm uppercase tracking-wider text-cyan-500 font-semibold">
                        Última actualización: Mayo de 2026
                    </p>

                    <div className="space-y-8 text-sm md:text-base leading-relaxed">
                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>1. ¿Qué son las cookies?</h2>
                            <p>
                                Las cookies son pequeños archivos de texto que los sitios web almacenan en su ordenador o dispositivo móvil cuando los visita. Ayudan a que el sitio recuerde sus acciones y preferencias (como inicio de sesión, idioma, tamaño de letra y otras preferencias de visualización) durante un período de tiempo.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>2. ¿Cómo utiliza Vix-Flow las cookies?</h2>
                            <p>
                                Utilizamos cookies estrictamente necesarias para el funcionamiento de nuestra plataforma. Específicamente, utilizamos:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li><strong>Cookies de sesión y autenticación:</strong> Permiten mantener su sesión abierta de forma segura mediante el almacenamiento de un token (Local Storage / Session Storage), evitando que tenga que iniciar sesión constantemente.</li>
                                <li><strong>Cookies de preferencias:</strong> Utilizadas para recordar elecciones de interfaz, como su preferencia por el modo oscuro (Dark Mode).</li>
                                <li><strong>Cookies de aceptación:</strong> Simplemente para recordar si usted ya hizo clic en "Aceptar" en nuestro banner de cookies.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>3. Gestión y eliminación de cookies</h2>
                            <p>
                                Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto para Vix-Flow, es posible que tenga que ajustar manualmente algunas preferencias (como el modo oscuro) e iniciar sesión cada vez que visite el sitio.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

        </div>
    );
}

export default Cookies;