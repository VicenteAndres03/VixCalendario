import { useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

function Footer() {
    const { darkMode } = useContext(ThemeContext);

    return (
        <footer className={`border-t py-8 ${darkMode ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"} transition-colors duration-500`}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Izquierda: Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span className="font-bold text-xl text-cyan-400">Vix-Flow</span>
                </div>

                {/* Centro: Copyright y Desarrollador */}
                <div className={`text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    <p>© {new Date().getFullYear()} Vix-Flow. Todos los derechos reservados.</p>
                    <p className="mt-1">
                        Desarrollado por <span className="font-semibold text-cyan-500">vixdeev 🚀</span>
                    </p>
                </div>

                {/* Derecha: Enlaces y Redes */}
                <div className="flex flex-col items-center lg:items-end gap-4">
                    {/* Enlaces Completos */}
                    <div className={`flex flex-wrap justify-center lg:justify-end gap-x-4 gap-y-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        <a href="/terminos" className="hover:text-cyan-400 transition-colors">Términos y Condiciones</a>
                        <span className="hidden sm:inline opacity-30">|</span>
                        <a href="/privacidad" className="hover:text-cyan-400 transition-colors">Política de Privacidad</a>
                        <span className="hidden sm:inline opacity-30">|</span>
                        <a href="/cookies" className="hover:text-cyan-400 transition-colors">Política de Cookies</a>
                        <span className="hidden sm:inline opacity-30">|</span>
                        <a href="/nosotros" className="hover:text-cyan-400 transition-colors">Acerca de nosotros</a>
                    </div>
                    
                    {/* Redes Sociales */}
                    <div className="flex gap-4">
                        {/* Instagram */}
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://instagram.com" target="_blank" rel="noreferrer" 
                            className={`${darkMode ? "text-gray-400 hover:text-pink-500" : "text-gray-500 hover:text-pink-600"} transition-colors`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </motion.a>

                        {/* TikTok */}
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://tiktok.com" target="_blank" rel="noreferrer"
                            className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"} transition-colors`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-.71 4.46-2.15 6.08-1.58 1.73-3.99 2.53-6.27 2.11-2.22-.38-4.22-1.84-5.24-3.8-1.2-2.29-1.07-5.18.29-7.35 1.18-1.92 3.4-3.12 5.61-3.23.01 1.34-.01 2.68.01 4.02-1.22.13-2.43.91-2.91 2.05-.56 1.3-.13 2.92.94 3.65 1.05.74 2.63.66 3.51-.27.87-.9 1.03-2.3 1.03-3.46.01-6.72-.01-13.44.02-20.16h3.09z"/>
                            </svg>
                        </motion.a>

                        {/* YouTube */}
                        <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://youtube.com" target="_blank" rel="noreferrer"
                            className={`${darkMode ? "text-gray-400 hover:text-red-500" : "text-gray-500 hover:text-red-600"} transition-colors`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                            </svg>
                        </motion.a>
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;