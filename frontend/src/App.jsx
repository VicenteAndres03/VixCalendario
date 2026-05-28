import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Registro from "./pages/Registro"
import Calendario from "./pages/Calendario"
import Tablero from "./pages/Tablero"
import Perfil from "./pages/Perfil"
import Amigos from "./pages/Amigos"
import Proyectos from "./pages/Proyectos"
import RutaProtegida from "./components/RutaProtegida"

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas Protegidas */}
        <Route 
          path="/calendario" 
          element={
            <RutaProtegida>
              <Calendario />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/tablero" 
          element={
            <RutaProtegida>
              <Tablero />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/tablero/:fecha" 
          element={
            <RutaProtegida>
              <Tablero />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/amigos" 
          element={
            <RutaProtegida>
              <Amigos />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/proyectos" 
          element={
            <RutaProtegida>
              <Proyectos />
            </RutaProtegida>
          } 
        />
        
        <Route 
          path="/perfil" 
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App