import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

function AvisoLegal() {
    const [mostrar, setMostrar] = useState(false);
    const { darkMode } = useContext(ThemeContext);

    useEffect(() => {
        // Verificamos si el usuario ya aceptó las cookies previamente
        const cookiesAceptadas = localStorage.getItem("cookiesAceptadas");
        if (!cookiesAceptadas) {
            // Si no hay registro, mostramos el banner
            setMostrar(true);
        }
    }, []);

    const handleAceptar = () => {
        // Guardamos la preferencia para que no le vuelva a salir
        localStorage.setItem("cookiesAceptadas", "true");
        setMostrar(false);
    };

    return (
        <AnimatePresence>
            {mostrar && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`fixed bottom-0 left-0 right-0 z-50 p-4 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${
                        darkMode ? "bg-gray-900 border-gray-800 text-gray-300" : "bg-white border-gray-200 text-gray-700"
                    }`}
                >
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-center sm:text-left">
                            <p>
                                🍪 Utilizamos cookies propias para garantizar el correcto funcionamiento de Vix-Flow (como mantener tu sesión iniciada) y mejorar tu experiencia. 
                                Al hacer clic en "Aceptar", consientes el uso de estas cookies. Puedes leer más en nuestra{" "}
                                <a href="/cookies" className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors hover:underline">
                                    Política de Cookies
                                </a>.
                            </p>
                        </div>
                        <div className="shrink-0 w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAceptar}
                                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-2.5 px-6 rounded-xl transition-all"
                            >
                                Aceptar Cookies
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default AvisoLegal;