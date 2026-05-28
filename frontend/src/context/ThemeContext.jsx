import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Leemos si ya había una preferencia guardada, si no, por defecto es oscuro
    const [darkMode, setDarkMode] = useState(() => {
        const guardado = localStorage.getItem("darkMode");
        return guardado ? JSON.parse(guardado) : true;
    });

    // Guardamos en localStorage para que no se pierda al recargar la página
    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}