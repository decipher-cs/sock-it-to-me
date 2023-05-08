import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'

const socket = io('http://localhost:8080', { autoConnect: false })

export interface User {
    userID?: string
    username?: string
    self?: boolean
}

function App() {
    const usr = 'vauban_' + crypto.randomUUID().slice(33)
    const [username, setUsername] = useState(usr)
    const [users, setUsers] = useState<User[]>([])
    const [custValue, setCustValue] = useState('')
    const [socketID, setSocketID] = useState('')
    const [message, setMessage] = useState(['example'])
    const outMsg = useRef('')

    useEffect(() => {
        console.clear()

        const sessionID = window.sessionStorage.getItem('sessionID')
        if (sessionID === null || sessionID === undefined) {
            socket.auth = { username: username }
        } else {
            socket.auth = { sessionID }
        }
        socket.connect()

        socket.on('connect', () => {
            setSocketID(socket.id)
        })

        socket.on('session', ({ userID, sessionID, username: savedUsername }: { [key: string]: string }) => {
            // socket.userID = userID
            socket.auth = { sessionID }
            window.sessionStorage.setItem('sessionID', sessionID)
            setUsername(savedUsername)
        })

        socket.on('users', (users: User[]) => {
            users.forEach(user => {
                user.self = user.userID === socket.id
            })
        })

        socket.on('user connected', ({ users }: { users: User[] }) => {
            setUsers(users.filter(usr => usr.userID !== socket.id))
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
                {users.map((usr, i) => (
                    <div key={i}>{usr.userID}</div>
                ))}
                <br />
                <b>Socket.io</b>
                <br /> <br />
                <b>{username}</b>
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
                <br /> <br /> <br />
                <button onClick={() => setMessage([])}>clear list</button>
            </div>
        </>
    )
}

export default App
