import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Privacidad() {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    // Efecto para que la página siempre cargue desde arriba
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
            {/* Navbar si está logueado, botón de volver si no lo está */}
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
                        Política de Privacidad
                    </h1>
                    <p className="mb-12 text-sm uppercase tracking-wider text-cyan-500 font-semibold">
                        Última actualización: Mayo de 2026
                    </p>

                    <div className="space-y-8 text-sm md:text-base leading-relaxed">
                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>1. Información que Recopilamos</h2>
                            <p>
                                En Vix-Flow, recopilamos la información que usted nos proporciona directamente al registrarse en nuestro servicio. Esto incluye:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li><strong>Datos de cuenta:</strong> Nombre, apellido, correo electrónico y contraseña (almacenada de forma encriptada).</li>
                                <li><strong>Datos de uso:</strong> Proyectos creados, tareas, horarios del calendario y miembros invitados a sus tableros.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>2. Cómo Utilizamos su Información</h2>
                            <p>
                                Utilizamos la información recopilada con los siguientes propósitos:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li>Proporcionar, mantener y mejorar nuestro Servicio.</li>
                                <li>Gestionar su cuenta y procesar su inicio de sesión de forma segura.</li>
                                <li>Enviarle notificaciones importantes, como correos de bienvenida o invitaciones a proyectos.</li>
                                <li>Calcular las métricas de enfoque y el progreso de sus proyectos.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>3. Protección y Seguridad de los Datos</h2>
                            <p>
                                La seguridad de sus datos es nuestra prioridad. Utilizamos medidas de seguridad comercialmente aceptables (como el cifrado de contraseñas mediante algoritmos robustos y la autenticación basada en tokens JWT) para proteger su información personal. Sin embargo, recuerde que ningún método de transmisión a través de Internet es 100% seguro.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>4. Compartir Información con Terceros</h2>
                            <p>
                                Vix-Flow no vende, alquila ni comercializa su información personal a terceros. Solo compartiremos su información en las siguientes circunstancias:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li>Para cumplir con una obligación legal o requerimiento judicial.</li>
                                <li>Para proteger y defender los derechos o la propiedad de Vix-Flow.</li>
                                <li>Con proveedores de servicios de confianza (como servicios de envío de correos o alojamiento web) que operan bajo estrictos acuerdos de confidencialidad.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>5. Retención y Eliminación de Datos</h2>
                            <p>
                                Conservaremos su información personal solo durante el tiempo que sea necesario para los fines establecidos en esta política. Si decide eliminar su cuenta desde la sección "Mi Perfil", su información pasará a un estado inactivo y su acceso será revocado inmediatamente.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>6. Sus Derechos</h2>
                            <p>
                                Dependiendo de su jurisdicción, usted tiene derecho a acceder, actualizar, modificar o solicitar la eliminación de su información personal. Puede gestionar la mayoría de estos datos directamente desde el panel de configuración de su perfil.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>7. Contacto</h2>
                            <p>
                                Si tiene alguna duda o consulta sobre esta Política de Privacidad, por favor contáctenos a través de nuestros canales oficiales de soporte.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

        </div>
    );
}

export default Privacidad;