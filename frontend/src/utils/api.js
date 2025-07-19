// API utility functions for authenticated requests
import { tokenStorage } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Base fetch function with authentication
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = tokenStorage.getToken()

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...tokenStorage.getAuthHeader(),
            ...options.headers
        },
        ...options
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

        // Handle token expiration
        if (response.status === 401) {
            tokenStorage.removeToken()
            window.location.hash = '#login'
            throw new Error('Authentication required')
        }

        return response
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

// GET request with authentication
export const apiGet = async (endpoint) => {
    return fetchWithAuth(endpoint, { method: 'GET' })
}

// POST request with authentication
export const apiPost = async (endpoint, data) => {
    return fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

// PUT request with authentication
export const apiPut = async (endpoint, data) => {
    return fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

// DELETE request with authentication
export const apiDelete = async (endpoint) => {
    return fetchWithAuth(endpoint, { method: 'DELETE' })
}

// Verify current user token
export const verifyToken = async () => {
    try {
        const response = await apiGet('/api/me')
        if (response.ok) {
            const data = await response.json()
            return data.user
        }
        return null
    } catch (error) {
        return null
    }
}
