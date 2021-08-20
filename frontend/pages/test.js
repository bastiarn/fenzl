import { useEffect } from 'react'
import io from 'socket.io-client'

export default function Test() {
  const socket = io()
  const emitfn = () => {
    console.log("emitting")
    socket.emit("msg", "no!")
  }
  useEffect(() => {
    fetch('/api/hello').finally(() => {

      socket.on('connect', () => {
        console.log('connect')
      })

      socket.on('a user connected', () => {
        console.log('a user connected')
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  }, []) // Added [] as useEffect filter so it will be executed only once, when component is mounted

  return <button onClick={emitfn}>Socket.io</button>
}