import { useEffect, useState } from "react";
import useGame from "../lib/hooks/useGame";
import io from "socket.io-client";
import Chart from "../lib/components/Chart";

function Stopped({ startGame }) {
  return (
    <div className="page-stopped center hz vc">
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

function Lost({ startGame }) {
  return (
    <div className="overlay-lost center vc hz">
      <button onClick={startGame}>Replay</button>
    </div>
  );
}

function InGame({ startGame, data }) {
  const {
    gameState,
    currentState,
    maxLives,
    lives,
    range,
    history,
    secondsLeft,
  } = data;
  let livesUsedPercentage = (maxLives - lives) / maxLives;
  let livesColor;
  if (livesUsedPercentage < 0.33) {
    livesColor = "good";
  }
  if (livesUsedPercentage > 0.33 && livesUsedPercentage < 0.66) {
    livesColor = "warning";
  }
  if (livesUsedPercentage > 0.66) {
    livesColor = "critical";
  }
  let pageBG;
  if (currentState?.hit) {
    pageBG = "critical";
  }
  return (
    <div className={`page-anythingelse ${pageBG}`}>
      <div className="graph">
        <Chart data={history} range={range} />
      </div>
      <div className="ui-elements">
        <div className="countdown">{secondsLeft}</div>
        <div className="db-display">
          {range && (
            <>
              <p className="range-max">
                <span>{range[1]}</span>
              </p>
            </>
          )}
          {currentState && (
            <>
              <p className="current-db-int">{Math.floor(currentState.dB)}</p>
              <p className="current-db-dec">
                .{Math.round((currentState.dB % 1) * 10, 1)}
              </p>
              <p className="dba">&nbsp;dB(A)</p>
            </>
          )}
          {range && (
            <>
              <p className="range-min">
                <span>{range[0]}</span>
              </p>
            </>
          )}
        </div>

        {gameState == "RUNNING" && (
          <>
            <div className={`lives center vc hz ${livesColor}`}>
              <span>{lives}</span>
            </div>
          </>
        )}
      </div>
      {gameState == "ANNOUNCEMENT" && (
        <div className="overlay-announcement center vc hz">
          <h1>Bereit Machen</h1>
        </div>
      )}
      {gameState == "LOST" && <Lost startGame={startGame} />}
    </div>
  );
}

function Game({ socket }) {
  const { startGame, ...state } = useGame(socket, 40);
  return (
    <>
      {state.gameState == "STOPPED" ? (
        <Stopped startGame={startGame} />
      ) : (
        <InGame data={state} startGame={startGame} />
      )}
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
