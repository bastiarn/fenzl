import { useState, useEffect } from "react";

const RANGE_MIN = 45;
const RANGE_MAX = 110;
const RANGE_SIZES = [25, 35, 45, 65];
const PREP_TIME = 3;
const MAX_LIVES = 10;
const ROUND_TIME = 15 * 60;

function createRange() {
  let range = RANGE_SIZES[Math.floor(Math.random() * RANGE_SIZES.length)];

  let min = Math.floor(
    RANGE_MIN + Math.random() * (RANGE_MAX - RANGE_MIN - range)
  );
  let max = min + range;

  return [min, max];
}

const setCountdown = (cb, cb_done, secs) => {
  cb(secs);
  let timeLeft = secs - 1;
  let interval = setInterval(() => {
    cb(timeLeft);
    if (timeLeft == 0) {
      clearInterval(interval);
      cb_done();
    }
    timeLeft--;
  }, 1000);

  return interval;
};

const useRange = () => {
  const [range, setRange] = useState();
  const setNewRange = () => {
    setRange(createRange());
  };
  return [range, setNewRange];
};

const useLives = (maxLives, onDeath) => {
  const [lives, setLives] = useState(maxLives);
  useEffect(() => {
    if (lives <= 0) {
      onDeath();
    }
  }, [lives]);

  const takeHit = () => {
    setLives((lives) => lives - 1);
  };

  const resetLives = () => {
    setLives(maxLives);
  };
  return [lives, takeHit, resetLives];
};
const usePast = (history = [], historyLength = 20) => {
  // Take the most hisoryLength recent entries in history
  const initialHistory = history.slice(-historyLength);
  const [state, setState] = useState(initialHistory);
  const appendElement = (el) => {
    setState((state) => {
      if (state.length < historyLength) {
        return state.concat([el]);
      } else {
        return state.slice(1).concat([el]);
      }
    });
  };

  return [state, appendElement];
};
export default function useGame(socket) {
  const [gameState, setGameState] = useState("STOPPED");
  const [lives, takeHit, resetLives] = useLives(MAX_LIVES, () =>
    setGameState("LOST")
  );
  const [range, setNewRange] = useRange();
  const [secondsLeft, setSecondsLeft] = useState();
  const [history, newEntry] = usePast([], 20);
  const startGame = () => setGameState("ANNOUNCEMENT");

  useEffect(() => {
    switch (gameState) {
      case "STOPPED":
        break;
      case "ANNOUNCEMENT":
        setNewRange();
        let announcementTimer = setCountdown(
          (timeLeft) => {
            setSecondsLeft(timeLeft);
          },
          () => {
            setGameState("RUNNING");
          },
          PREP_TIME
        );
        return () => clearInterval(announcementTimer);
      case "RUNNING":
        resetLives();
        const RealTimeInHandler = (dB) => {
          const [min, max] = range;
          if (dB > max || dB < min) {
            takeHit();
            newEntry({ dB, hit: true });
          } else {
            newEntry({ dB, hit: false });
          }
        };
        let roundTimer = setCountdown(
          (timeLeft) => {
            setSecondsLeft(timeLeft);
          },
          startGame,
          ROUND_TIME
        );
        socket.on("rt_in", RealTimeInHandler);
        return () => {
          socket.off("rt_in", RealTimeInHandler);
          clearInterval(roundTimer);
        };
      case "LOST":
        // TODO: - SET DOM VISUAL ALARM
        //       - PLAY AUDIO ALARM
        //       - GOTO STATE "STOPPED" ONCE DONE
        break;
    }
  }, [gameState, socket]);

  return {
    gameState,
    ...(gameState == "ANNOUNCEMENT" && { secondsLeft, range }),
    ...(gameState == "RUNNING" && { secondsLeft, lives, range }),
    ...(gameState == "LOST" && { lives }),
    history,
    startGame,
  };
}
