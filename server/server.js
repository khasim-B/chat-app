import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/msgRoutes.js'
import { Server } from 'socket.io'

// creating an express server
const app = express()

app.use(express.json())
const server = http.createServer(app)

// initialize socket.io server
export const io = new Server(server, { cors: { origin: "*" } })

// store online users
export const userSocketMap = {} // { userId: socketId }

// socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId

    console.log("user connected", userId);

    if (userId) userSocketMap[userId] = socket.id

    // emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("user disconnected", userId);
        delete userSocketMap[userId]
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

// middleware setup
app.use(express.json({ limit: "4mb" }))
app.use(cors())

app.use('/api/status', (req, res) => res.send('server runnning'))

app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// connecing db
await connectDB()

// if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
        console.log('server running at ' + PORT);
    })
// }


// // exporting server for vercel
export default server