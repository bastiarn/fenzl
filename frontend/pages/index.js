import { useEffect, useState } from "react";
import useGame from "../lib/hooks/useGame";
import io from "socket.io-client";

function Game({ socket }) {
  const { startGame, ...state } = useGame(socket);
  return (
    <>
      {state.gameState == "STOPPED" && (
        <button onClick={startGame}>Start Game</button>
      )}
      {state.gameState == "ANNOUNCEMENT" && <h1>ANNOUNCEMENT</h1>}
      {state.gameState == "RUNNING" && <h1>RUNNING</h1>}
      {state.gameState == "LOST" && (
        <>
          <h1>U LOST. U NOOB.</h1>
          <button onClick={startGame}>Replay</button>
        </>
      )}
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
