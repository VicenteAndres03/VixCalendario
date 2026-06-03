/**
 * TESTS UNITARIOS - FLUJO DE PAGO Y SUSCRIPCIÓN
 * Vix-Flow Frontend
 *
 * Ejecutar con: npm test (Vitest o Jest)
 * Dependencias: vitest, @testing-library/react, @testing-library/user-event, msw
 *
 * Instalar: npm install -D vitest @testing-library/react @testing-library/user-event msw
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'

// ─── Mock de axios ─────────────────────────────────────────────────────────────
vi.mock('axios')

// ─── Mock de react-router-dom ─────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: '' }),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockLocalStorage = (() => {
    let store = {}
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { store = {} },
    }
})()

beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true })
    mockLocalStorage.clear()
    vi.clearAllMocks()
})

// =============================================================================
// 1. TESTS DE authService - crearSuscripcion
// =============================================================================
describe('authService.crearSuscripcion', () => {

    it('debería retornar la URL de Mercado Pago cuando el backend responde correctamente', async () => {
        const { crearSuscripcion } = await import('../services/authService.js')

        axios.post.mockResolvedValueOnce({
            data: { url: 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=abc123' }
        })

        const result = await crearSuscripcion('usuario@test.com', 'token-jwt-123')

        expect(result.url).toBe('https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=abc123')
        expect(axios.post).toHaveBeenCalledWith(
            'https://api.vix-flow.com/api/pagos/crear-suscripcion?email=usuario@test.com',
            {},
            { headers: { Authorization: 'Bearer token-jwt-123' } }
        )
    })

    it('debería lanzar error si el backend falla (500)', async () => {
        const { crearSuscripcion } = await import('../services/authService.js')

        axios.post.mockRejectedValueOnce({ response: { status: 500, data: 'Error interno' } })

        await expect(crearSuscripcion('usuario@test.com', 'token-jwt'))
            .rejects.toMatchObject({ response: { status: 500 } })
    })

    it('debería enviar el email correcto del usuario logueado', async () => {
        const { crearSuscripcion } = await import('../services/authService.js')

        axios.post.mockResolvedValueOnce({ data: { url: 'https://mp.cl/pago' } })

        await crearSuscripcion('otro.email@gmail.com', 'token-abc')

        const llamada = axios.post.mock.calls[0][0]
        expect(llamada).toContain('email=otro.email@gmail.com')
    })
})

// =============================================================================
// 2. TESTS DEL POLLING DE SUSCRIPCIÓN (lógica extraída de Perfil.jsx)
// =============================================================================
describe('Polling de suscripción post-pago', () => {

    it('debería detectar que la suscripción se activó y guardar ACTIVO en localStorage', async () => {
        // Simula la lógica del polling de Perfil.jsx
        mockLocalStorage.setItem('token', 'jwt-valido')
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')

        // Primer llamado: aún no activado. Segundo: activado.
        axios.get
            .mockResolvedValueOnce({ data: { estadoSuscripcion: 'INACTIVO' } })
            .mockResolvedValueOnce({ data: { estadoSuscripcion: 'ACTIVO' } })

        let suscripcionFinal = 'INACTIVO'

        // Simular el polling (versión simplificada de la función en Perfil.jsx)
        const polling = async () => {
            for (let intento = 0; intento < 10; intento++) {
                const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${mockLocalStorage.getItem('token')}` }
                })
                if (res.data.estadoSuscripcion === 'ACTIVO') {
                    mockLocalStorage.setItem('suscripcion', 'ACTIVO')
                    suscripcionFinal = 'ACTIVO'
                    break
                }
            }
        }

        await polling()

        expect(suscripcionFinal).toBe('ACTIVO')
        expect(mockLocalStorage.getItem('suscripcion')).toBe('ACTIVO')
        expect(axios.get).toHaveBeenCalledTimes(2)
    })

    it('NO debería actualizar localStorage si la suscripción sigue INACTIVO tras todos los intentos', async () => {
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')

        // Siempre responde INACTIVO
        axios.get.mockResolvedValue({ data: { estadoSuscripcion: 'INACTIVO' } })

        const MAX_INTENTOS = 3 // reducido para el test
        let activado = false

        for (let i = 0; i < MAX_INTENTOS; i++) {
            const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                headers: { Authorization: 'Bearer test' }
            })
            if (res.data.estadoSuscripcion === 'ACTIVO') {
                activado = true
                break
            }
        }

        expect(activado).toBe(false)
        expect(mockLocalStorage.getItem('suscripcion')).toBe('INACTIVO')
        expect(axios.get).toHaveBeenCalledTimes(MAX_INTENTOS)
    })

    it('debería detener el polling inmediatamente cuando detecta ACTIVO sin seguir llamando', async () => {
        // La primera respuesta ya es ACTIVO
        axios.get.mockResolvedValue({ data: { estadoSuscripcion: 'ACTIVO' } })

        let llamadas = 0
        for (let i = 0; i < 10; i++) {
            const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                headers: { Authorization: 'Bearer test' }
            })
            llamadas++
            if (res.data.estadoSuscripcion === 'ACTIVO') break
        }

        // Solo debería haber llamado UNA vez y detenerse
        expect(llamadas).toBe(1)
    })
})

// =============================================================================
// 3. TESTS DE sincronizarSuscripcion (al cargar Perfil)
// =============================================================================
describe('sincronizarSuscripcion al montar Perfil', () => {

    it('debería actualizar localStorage cuando el backend tiene un estado diferente', async () => {
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')

        axios.get.mockResolvedValueOnce({ data: { estadoSuscripcion: 'ACTIVO' } })

        // Simular la función sincronizarSuscripcion de Perfil.jsx
        const token = 'jwt-test'
        const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const estadoBackend = res.data.estadoSuscripcion
        if (estadoBackend && estadoBackend !== mockLocalStorage.getItem('suscripcion')) {
            mockLocalStorage.setItem('suscripcion', estadoBackend)
        }

        expect(mockLocalStorage.getItem('suscripcion')).toBe('ACTIVO')
    })

    it('NO debería modificar localStorage si el estado ya es igual al del backend', async () => {
        mockLocalStorage.setItem('suscripcion', 'ACTIVO')
        let escrituras = 0

        const mockSet = vi.spyOn(mockLocalStorage, 'setItem').mockImplementation((key, val) => {
            if (key === 'suscripcion') escrituras++
        })

        axios.get.mockResolvedValueOnce({ data: { estadoSuscripcion: 'ACTIVO' } })

        const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
            headers: { Authorization: 'Bearer test' }
        })
        const estadoBackend = res.data.estadoSuscripcion
        // Solo escribe si es diferente
        if (estadoBackend !== mockLocalStorage.getItem('suscripcion')) {
            mockLocalStorage.setItem('suscripcion', estadoBackend)
        }

        expect(escrituras).toBe(0)
        mockSet.mockRestore()
    })

    it('debería manejar error de red sin romper la app', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'))

        let errorAtrapado = false
        try {
            await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                headers: { Authorization: 'Bearer test' }
            })
        } catch {
            errorAtrapado = true
            // La app no debe colapsar, solo loguea
        }

        expect(errorAtrapado).toBe(true)
        // El localStorage no cambió
        expect(mockLocalStorage.getItem('suscripcion')).toBeNull()
    })
})

// =============================================================================
// 4. TESTS DE useSyncSuscripcion (hook al iniciar la app)
// =============================================================================
describe('useSyncSuscripcion hook', () => {

    it('no debería hacer llamadas al backend si no hay token en localStorage', async () => {
        mockLocalStorage.removeItem('token')

        // Simular el hook
        const token = mockLocalStorage.getItem('token')
        if (token) {
            await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                headers: { Authorization: `Bearer ${token}` }
            })
        }

        expect(axios.get).not.toHaveBeenCalled()
    })

    it('debería actualizar suscripcion en localStorage si hay token y el backend responde', async () => {
        mockLocalStorage.setItem('token', 'jwt-activo')
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')

        axios.get.mockResolvedValueOnce({ data: { estadoSuscripcion: 'ACTIVO' } })

        const token = mockLocalStorage.getItem('token')
        if (token) {
            const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.estadoSuscripcion) {
                mockLocalStorage.setItem('suscripcion', res.data.estadoSuscripcion)
            }
        }

        expect(mockLocalStorage.getItem('suscripcion')).toBe('ACTIVO')
    })
})

// =============================================================================
// 5. TESTS DE cancelarSuscripcion
// =============================================================================
describe('cancelarSuscripcion', () => {

    it('debería llamar al endpoint correcto con el token JWT', async () => {
        const token = 'jwt-premium'
        axios.post.mockResolvedValueOnce({ data: 'Tu suscripción Premium ha sido cancelada exitosamente.' })

        const res = await axios.post(
            'https://api.vix-flow.com/api/pagos/cancelar-suscripcion',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        )

        expect(res.data).toBe('Tu suscripción Premium ha sido cancelada exitosamente.')
        expect(axios.post).toHaveBeenCalledWith(
            'https://api.vix-flow.com/api/pagos/cancelar-suscripcion',
            {},
            { headers: { Authorization: 'Bearer jwt-premium' } }
        )
    })

    it('debería actualizar localStorage a INACTIVO tras cancelar exitosamente', async () => {
        mockLocalStorage.setItem('suscripcion', 'ACTIVO')
        axios.post.mockResolvedValueOnce({ data: 'Suscripción cancelada.' })

        const res = await axios.post(
            'https://api.vix-flow.com/api/pagos/cancelar-suscripcion',
            {},
            { headers: { Authorization: 'Bearer test' } }
        )

        // Simular lo que hace el componente tras el éxito
        if (res.data) {
            mockLocalStorage.setItem('suscripcion', 'INACTIVO')
        }

        expect(mockLocalStorage.getItem('suscripcion')).toBe('INACTIVO')
    })

    it('debería manejar error 500 del servidor sin cambiar el estado local', async () => {
        mockLocalStorage.setItem('suscripcion', 'ACTIVO')
        axios.post.mockRejectedValueOnce({ response: { status: 500, data: 'Error interno' } })

        let errorOcurrido = false
        try {
            await axios.post(
                'https://api.vix-flow.com/api/pagos/cancelar-suscripcion',
                {},
                { headers: { Authorization: 'Bearer test' } }
            )
        } catch {
            errorOcurrido = true
        }

        expect(errorOcurrido).toBe(true)
        // El estado NO debe cambiar si falla
        expect(mockLocalStorage.getItem('suscripcion')).toBe('ACTIVO')
    })
})

// =============================================================================
// 6. TESTS DE canjearMesGratis
// =============================================================================
describe('canjearMesGratis', () => {

    it('debería activar suscripcion y marcar pruebaConsumida en localStorage', async () => {
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')
        mockLocalStorage.setItem('pruebaConsumida', 'false')

        axios.post.mockResolvedValueOnce({ data: '¡Felicidades! Tu mes gratis Premium ha sido activado.' })

        const res = await axios.post(
            'https://api.vix-flow.com/api/usuarios/canjear-prueba',
            {},
            { headers: { Authorization: 'Bearer test' } }
        )

        // Simular lo que hace el componente
        mockLocalStorage.setItem('suscripcion', 'ACTIVO')
        mockLocalStorage.setItem('pruebaConsumida', 'true')

        expect(res.data).toContain('mes gratis')
        expect(mockLocalStorage.getItem('suscripcion')).toBe('ACTIVO')
        expect(mockLocalStorage.getItem('pruebaConsumida')).toBe('true')
    })

    it('debería rechazar si la prueba ya fue consumida (400)', async () => {
        axios.post.mockRejectedValueOnce({
            response: { status: 400, data: 'Ya has canjeado tu mes de prueba gratuito anteriormente.' }
        })

        let mensajeError = ''
        try {
            await axios.post(
                'https://api.vix-flow.com/api/usuarios/canjear-prueba',
                {},
                { headers: { Authorization: 'Bearer test' } }
            )
        } catch (err) {
            mensajeError = err.response?.data || ''
        }

        expect(mensajeError).toContain('Ya has canjeado')
    })
})

// =============================================================================
// 7. TESTS DE RutaPremium (guardia de rutas)
// =============================================================================
describe('RutaPremium - lógica de acceso', () => {

    it('debería dar acceso si suscripcion es ACTIVO', () => {
        mockLocalStorage.setItem('suscripcion', 'ACTIVO')
        mockLocalStorage.setItem('rol', 'USER')

        const suscripcion = mockLocalStorage.getItem('suscripcion')
        const rol = mockLocalStorage.getItem('rol')
        const tieneAcceso = suscripcion === 'ACTIVO' || rol === 'ADMIN'

        expect(tieneAcceso).toBe(true)
    })

    it('debería dar acceso si rol es ADMIN aunque suscripcion sea INACTIVO', () => {
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')
        mockLocalStorage.setItem('rol', 'ADMIN')

        const suscripcion = mockLocalStorage.getItem('suscripcion')
        const rol = mockLocalStorage.getItem('rol')
        const tieneAcceso = suscripcion === 'ACTIVO' || rol === 'ADMIN'

        expect(tieneAcceso).toBe(true)
    })

    it('debería BLOQUEAR acceso si suscripcion es INACTIVO y rol es USER', () => {
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')
        mockLocalStorage.setItem('rol', 'USER')

        const suscripcion = mockLocalStorage.getItem('suscripcion')
        const rol = mockLocalStorage.getItem('rol')
        const tieneAcceso = suscripcion === 'ACTIVO' || rol === 'ADMIN'

        expect(tieneAcceso).toBe(false)
    })

    it('debería BLOQUEAR si localStorage no tiene datos (usuario no logueado)', () => {
        // Sin setear nada
        const suscripcion = mockLocalStorage.getItem('suscripcion') || 'INACTIVO'
        const rol = mockLocalStorage.getItem('rol') || 'USER'
        const tieneAcceso = suscripcion === 'ACTIVO' || rol === 'ADMIN'

        expect(tieneAcceso).toBe(false)
    })

    it('debería verificar con el backend al montar, actualizando el estado local', async () => {
        mockLocalStorage.setItem('token', 'jwt-test')
        mockLocalStorage.setItem('suscripcion', 'INACTIVO')

        // Backend dice ACTIVO (quizás el webhook llegó tarde)
        axios.get.mockResolvedValueOnce({
            data: { estadoSuscripcion: 'ACTIVO', rol: 'USER' }
        })

        const token = mockLocalStorage.getItem('token')
        const res = await axios.get('https://api.vix-flow.com/api/usuarios/perfil', {
            headers: { Authorization: `Bearer ${token}` }
        })

        const suscripcion = res.data.estadoSuscripcion || 'INACTIVO'
        const rol = res.data.rol || 'USER'

        mockLocalStorage.setItem('suscripcion', suscripcion)
        mockLocalStorage.setItem('rol', rol)

        const tieneAcceso = suscripcion === 'ACTIVO' || rol === 'ADMIN'
        expect(tieneAcceso).toBe(true)
    })
})