import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // URL API Backend dari environment variable
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Pengaman agar tidak menggantung jika server down
})

// Pasang interceptor jika ke depannya ada sistem login
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interseptor respon untuk menangani error unauthorized (401)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            
            // Redirect ke login jika pengguna tidak di halaman auth saat ini
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosClient