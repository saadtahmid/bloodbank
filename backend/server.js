// Main entry point: sets up express, imports routers, and starts the server

import express from 'express'
import locationRoutes from './routes/locationRoutes.js'
import userRoutes from './routes/userRoutes.js'
// ...import other routers as you create them...

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// Register routers
app.use('/api/locations', locationRoutes)
app.use('/api', userRoutes)
// app.use('/api/bloodbanks', bloodBankRoutes) // Example for future
app.get('/', (req, res) => {
    res.send('Welcome to the Blood Donation API')})
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



