import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Terminos() {
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    // Efecto para que la página siempre cargue desde arriba
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gray-950 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
            {/* Solo mostramos el Navbar si el usuario tiene un token (está logueado). Si no, mostramos un botón de volver */}
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
                        Términos y Condiciones
                    </h1>
                    <p className="mb-12 text-sm uppercase tracking-wider text-cyan-500 font-semibold">
                        Última actualización: Mayo de 2026
                    </p>

                    <div className="space-y-8 text-sm md:text-base leading-relaxed">
                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>1. Aceptación de los Términos</h2>
                            <p>
                                Al acceder y utilizar Vix-Flow ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. 
                                Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio. 
                                Vix-Flow es una plataforma de gestión de proyectos y calendario diseñada para facilitar la productividad.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>2. Cuentas de Usuario</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio.</li>
                                <li>Debe proporcionar información precisa, completa y actualizada en todo momento al registrarse.</li>
                                <li>No puede utilizar como nombre de usuario el nombre de otra persona o entidad que no esté legalmente disponible para su uso.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>3. Uso del Servicio</h2>
                            <p>
                                Usted acepta no utilizar el Servicio para ningún propósito ilegal o no autorizado. Se compromete a no interferir ni interrumpir los servidores o redes conectadas a Vix-Flow. 
                                Nos reservamos el derecho de suspender o cancelar su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, el incumplimiento de los Términos.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>4. Contenido y Colaboración</h2>
                            <p>
                                Nuestro Servicio le permite publicar, enlazar y compartir información, texto y otros materiales. Usted es responsable del contenido que publica en Vix-Flow. 
                                En los proyectos colaborativos, las acciones realizadas por los miembros invitados bajo su autorización son de su entera responsabilidad.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>5. Propiedad Intelectual</h2>
                            <p>
                                El Servicio y su contenido original (excluyendo el contenido proporcionado por los usuarios), características y funcionalidad son y seguirán siendo propiedad exclusiva de Vix-Flow y sus licenciantes. 
                                El Servicio está protegido por derechos de autor y otras leyes aplicables.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>6. Legislación Aplicable</h2>
                            <p>
                                Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República de Chile, sin tener en cuenta sus disposiciones sobre conflictos de leyes. 
                                Nuestra incapacidad para hacer cumplir cualquier derecho o disposición de estos Términos no se considerará una renuncia a esos derechos.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>7. Cambios en los Términos</h2>
                            <p>
                                Nos reservamos el derecho, a nuestro exclusivo criterio, de modificar o reemplazar estos Términos en cualquier momento. 
                                Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de anticipación antes de que entren en vigencia los nuevos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>8. Contacto</h2>
                            <p>
                                Si tiene alguna pregunta sobre estos Términos, comuníquese con nosotros a través de los canales proporcionados en nuestro portal.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

        </div>
    );
}

export default Terminos;