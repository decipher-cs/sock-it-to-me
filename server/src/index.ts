import { createServer } from 'http'
import { Server } from 'socket.io'
import './utils.js'
import { addNewMessage, addNewUser, findMessageForUserID, findUserWithSessionID, randomID } from './utils.js'

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: 'http://localhost:5173' } })

export interface User {
    userID: string
    username?: string
    sessionID?: string
}

declare module 'socket.io' {
    interface Socket {
        userID: string
        username?: string
        sessionID?: string
    }
}

io.use((socket, next) => {
    socket.username // Error: property "username" does not exist ...
    const sessionID: string = socket.handshake.auth.sessionID
    if (sessionID !== undefined) {
        // find existing session
        const session = findUserWithSessionID(sessionID)
        if (session !== undefined) {
            socket.userID = session.userID
            socket.username = session.username
            socket.sessionID = sessionID
            return next()
        }
    }

    const username = socket.handshake.auth.username
    if (username === undefined) return next(new Error('invalid username'))
    socket.username = username
    socket.userID = randomID()
    socket.sessionID = randomID()
    addNewUser(username, socket.sessionID, socket.userID)
    return next()
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

    socket.join(socket.userID)

    socket.emit('session', { userID: socket.userID, sessionID: socket.sessionID, username: socket.username })

    socket.emit('user connected', { users })

   findMessageForUserID(socket.userID).forEach(msg=>{
        socket.to(socket.userID).emit('private message', {
            content: msg.content,
            from: msg.userID
        })
    }) 

    socket.on('private message', ({ content, to }: { [key: string]: string }) => {
        socket.to(to).to(socket.userID).emit('private message', {
            content,
            from: socket.id,
        })
        addNewMessage(socket.userID, content, to)
    })
})

httpServer.listen(8080, () => {
    console.log('server listening on port 8080')
})
