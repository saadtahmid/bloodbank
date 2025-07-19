// Token storage utilities for JWT authentication
export const AUTH_TOKEN_KEY = 'bloodbank_auth_token'
export const USER_DATA_KEY = 'bloodbank_user_data'

export const tokenStorage = {
    // Store token in localStorage
    setToken: (token) => {
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token)
        }
    },

    // Get token from localStorage
    getToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY)
    },

    // Remove token from localStorage
    removeToken: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
    },

    // Store user data
    setUserData: (userData) => {
        if (userData) {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
        }
    },

    // Get user data
    getUserData: () => {
        const userData = localStorage.getItem(USER_DATA_KEY)
        return userData ? JSON.parse(userData) : null
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = tokenStorage.getToken()
        if (!token) return false

        try {
            // Check if token is expired (basic check)
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            return payload.exp > currentTime
        } catch (error) {
            return false
        }
    },

    // Get authorization header for API calls
    getAuthHeader: () => {
        const token = tokenStorage.getToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
    }
}
