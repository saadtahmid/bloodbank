// Main entry point: sets up express, imports routers, and starts the server

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import transferRoutes from './routes/transferRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001
app.use(cors({
    origin: 'https://bloodbank-frontend-lake.vercel.app', // Adjust this to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json())

// Routes
app.use('/api', userRoutes)
app.use('/api', locationRoutes)
app.use('/api', transferRoutes)
app.use('/api/stats', statsRoutes)

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Blood Bank Management System API' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app



