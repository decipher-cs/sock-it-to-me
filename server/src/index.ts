import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: 'http://localhost:5173' } })

io.on('connection', socket => {
    console.log('socket ready on server.', socket.id)
})

httpServer.listen(8080, () => {
    console.log('server listening on port 8080')
})
