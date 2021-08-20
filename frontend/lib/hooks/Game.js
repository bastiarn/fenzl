import { useState, useEffect, useCallback } from "react";

const RANGE_MIN = 45;
const RANGE_MAX = 110;
const RANGE_SIZES = [25, 35, 45, 65];
const PREP_TIME = 3;

function createRange() {
  let range = RANGE_SIZES[Math.floor(Math.random() * RANGE_SIZES.length)];

  let min = Math.floor(
    RANGE_MIN + Math.random() * (RANGE_MAX - RANGE_MIN - range)
  );
  let max = min + range;

  return [min, max];
}

const setCountdown = (cb, cb_done, secs) => {
  let timeLeft = secs;
  let interval = setInterval(() => {
    if (timeLeft == 0) {
      clearInterval(interval);
      cb_done();
    } else {
      cb(timeLeft);
    }
    timeLeft--;
  }, 1000);
};

const useRange = () => {
  const [range, setRange] = useState();
  const setNewRange = () => {
    setRange(createRange());
  };
  return [range, setNewRange];
};

export default function useGame(socket) {
  const [gameState, setGameState] = useState("STOPPED");
  const [lives, setLives] = useState();
  const [range, setNewRange] = useRange();
  const [secondsLeft, setSecondsLeft] = useState();

  const startGame = () => setGameState("ANNOUNCEMENT");

  const RealTimeInHandler = (dB) => {
    const [min, max] = range;
    console.log(min, db, max);
    console.log("");
    if (dB > max || dB < min) {
      if (lives == 1) {
        setGameState("LOST");
      }
      setLives((lives) => lives - 1);
    }
  };

  useEffect(() => {
    switch (gameState) {
      case "STOPPED":
        break;
      case "ANNOUNCEMENT":
        setNewRange();
        setSecondsLeft(PREP_TIME);
        setCountdown(
          (timeLeft) => {
            setSecondsLeft(timeLeft);
          },
          () => {
            setSecondsLeft();
            setGameState("RUNNING");
          },
          PREP_TIME - 1
        );
        break;
      case "RUNNING":
        setLives(2);
        socket.on("rt_in", RealTimeInHandler);
        return () => socket.off("rt_in");
        break;
      case "LOST":
        // TODO: - SET DOM VISUAL ALARM
        //       - PLAY AUDIO ALARM
        //       - GOTO STATE "STOPPED" ONCE DONE
        break;
    }
  }, [gameState, socket]);

  return {
    gameState,
    secondsLeft,
    lives,
    range,
    startGame,
  };
}
