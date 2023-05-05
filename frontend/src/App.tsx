import { useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8080')

function App() {
    useEffect(() => {
        socket.on('connection', () => {
            console.log('connection establishd on clientside')
        })
    }, [])

    return (
        <>
            <div>
                <b>Socket.io</b>
            </div>
        </>
    )
}

export default App
