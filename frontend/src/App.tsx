import { useEffect, useRef, useState } from 'react'
import './App.css'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080', { autoConnect: false })

interface User {
    id: string
    username: string
    self?: boolean
}

function App() {
    const randomCharUntrimmed = crypto.randomUUID().toString()
    const randomChar = randomCharUntrimmed.slice(32)
    const username = useRef('vuban_' + randomChar)
    const users = useRef<User[]>([])
    const [custValue, setCustValue] = useState('')

    useEffect(() => {
        console.clear()

        socket.auth = { username: username.current }
        socket.connect()

        console.log('user is -->>', socket.auth.username)

        // socket.onAny((event, ...args) => {
        //     console.log('onAny ran:', event, args)
        // })

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

        socket.emit('test', 'hello')

        socket.on('private message', ({ content, from }) => {
            console.log('message from user', from, ':::-->>', content)
        })

        return () => {
            socket.disconnect
        }
    }, [])

    return (
        <>
            <div>
                <b>Socket.io test run</b>
                <br />
                <input value={custValue} onChange={e => setCustValue(e.target.value)} />
                <button
                    type='button'
                    onClick={() => {
                        socket.emit('private message', { content: 'hellowold', to: custValue })
                    }}
                >
                    emit
                </button>
            </div>
        </>
    )
}

export default App
