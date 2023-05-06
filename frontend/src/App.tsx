import { useEffect, useRef, useState } from 'react'
import './App.css'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080', { autoConnect: true })

interface User {
    id: string
    username: string
    self?: boolean
}

// const onMessage = content => {
//     if (this.selectedUser) {
//         socket.emit('private message', {
//             content,
//             to: this.selectedUser.userID,
//         })
//         this.selectedUser.messages.push({
//             content,
//             fromSelf: true,
//         })
//     }
// }

function App() {
    const randomCharUntrimmed = crypto.randomUUID().toString()
    const randomChar = randomCharUntrimmed.slice(32)
    const username = useRef('vuban_' + randomChar)
    const users = useRef<User[]>([])
    const [custValue, setCustValue] = useState('')

    useEffect(() => {
        socket.auth = { username: username.current }

        socket.onAny((event, ...args) => {
            console.log('onAny ran:', event, args)
        })

        socket.on('connect', () => {
            console.log('connection establishd on client-side with id:', socket.id)
        })

        socket.on('users', (users: User[]) => {
            users.forEach(user => {
                user.self = user.id === socket.id
            })
        })

        socket.on('user connected', (user: User) => {
            users.current.push(user)
        })

        socket.on('private message', ({ content, from }) => {
            console.log('message from user', from, ':::-->>', content)
        })
    }, [])

    return (
        <>
            <div>
                <b>Socket.io test run</b>
                <br />
                <input onChange={(e)=>setCustValue(e.target.value)} value={custValue}/>
                <input
                    type='button'
                    value='emit'
                    onClick={() => {
                        socket.emit('private message', { content: 'hellowold', to: socket.users })
                    }}
                />
            </div>
        </>
    )
}

export default App
