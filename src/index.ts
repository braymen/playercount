import express, { Request, Response } from 'express'
import http from 'http'
import { Server } from 'socket.io'

const port = Number(process.env.PORT ?? 3000)
const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())

const getUserCountByGame = (gameId: string) => io.sockets.adapter.rooms.get(gameId)?.size ?? 0

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

app.get('/count/:gameId', (req: Request, res: Response) => {
    const gameId = String(req.params.gameId)

    console.log(`Giving player count for: ${gameId}`)

    res.json({
        gameId,
        count: getUserCountByGame(gameId),
    })
})

io.on('connection', (socket) => {
    const gameId = socket.handshake.auth.gameId

    console.log(`A new user has connected to ${gameId}: `, socket.id)

    socket.join(gameId)

    io.to(gameId).emit('playerCount', { gameId, count: getUserCountByGame(gameId) })

    socket.on('disconnecting', () => {
        io.to(gameId).emit('playerCount', { gameId, count: getUserCountByGame(gameId) - 1 })
    })
})
// UI Usage: io(url, { auth: { gameId: 'game name' } })
// Player Count: socket.on('playerCount', (data) => {})

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})
