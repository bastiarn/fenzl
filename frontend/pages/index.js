import { useEffect, useState } from "react";
import useGame from "../lib/hooks/Game";
import io from "socket.io-client";

function Game({ socket }) {
  const { startGame, ...state } = useGame(socket);
  return (
    <>
      <button onClick={startGame}>Start Game</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
}

export default function Home() {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  return socket ? <Game socket={socket} /> : <p>Loading...</p>;
}
