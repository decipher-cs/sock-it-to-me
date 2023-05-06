import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: 'http://localhost:5173' } })

declare module 'socket.io' {
    interface Socket {
        username?: string
    }
}

interface User {
    userID: string
    username: string
}

io.use((socket, next) => {
    const username = socket.handshake.auth.username
    if (username === undefined) return next(new Error('invalid username'))
    socket.username = username
    next()
})

io.on('connection', socket => {
    const users: User[] = []

    for (const [id, socket] of io.of('/').sockets) {
        users.push({
            userID: id,
            username: socket.username ?? 'undef00',
        })
    }

    console.log('new user', socket.username, 'connected.')
    console.log('users are;', users)

    socket.broadcast.emit('user connected', {
        userID: socket.id,
        username: socket.username,
    })

    socket.on('private message', ({ content, to }: { [key: string]: string }) => {
        socket.to(to).emit('private message', {
            content,
            from: socket.id, // This should not work because from: socket.id would be wrong... i think...
        })
    })
})

httpServer.listen(8080, () => {
    console.log('server listening on port 8080')
})
