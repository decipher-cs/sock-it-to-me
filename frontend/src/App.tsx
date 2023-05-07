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
    const [socketID, setSocketID] = useState('')
    const [message, setMessage] = useState(['example'])
    const outMsg = useRef('')

    useEffect(() => {
        console.clear()

        socket.auth = { username: username.current }
        socket.connect()

        // socket.onAny((event, ...args) => {
        //     console.log('onAny ran:', event, args)
        // })

        socket.on('connect', () => {
            setSocketID(socket.id)
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
            console.log('Priv Msg:', from, ':::-->>', content)
            setMessage(prev => prev.concat(content))
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return (
        <>
            <div>
                <b>Socket.io</b>
                <br />
                <br />
                <b>{username.current}</b>
                <br />
                <b>{socketID}</b>
                <br />
                <input onChange={e => (outMsg.current = e.target.value)} placeholder='Enter message to sent' />
                <br />
                <br />
                <input
                    value={custValue}
                    onChange={e => setCustValue(e.target.value)}
                    placeholder='Enter room/ person ID here'
                />
                <br />
                <button
                    type='button'
                    onClick={() => {
                        socket.emit('private message', { content: outMsg.current, to: custValue })
                    }}
                >
                    emit
                </button>
                <br /> <br /> <br />
                ____________
                {message.map((msg, i) => (
                    <div key={i}>
                        {i}. {msg}
                    </div>
                ))}
                ____________
            </div>
        </>
    )
}

export default App
