import { useState, useEffect } from "react";

const RANGE_MIN = 35;
const RANGE_MAX = 90;
const RANGE_SIZES = [15, 20, 25, 35];
const PREP_TIME = 15;
const MAX_LIVES = 5;
const ROUND_TIME = 5 * 60;

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
  let initialHistory;
  if (history.length > historyLength) {
    initialHistory = history.slice(-historyLength);
  } else {
    initialHistory = [...history, ...Array(historyLength - history.length)];
  }
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
export default function useGame(socket, historyLength = 40) {
  const [gameState, setGameState] = useState("STOPPED");
  const [lives, takeHit, resetLives] = useLives(MAX_LIVES, () =>
    setGameState("LOST")
  );
  const [range, setNewRange] = useRange();
  const [secondsLeft, setSecondsLeft] = useState();
  const [history, newEntry] = usePast([], historyLength);
  const startGame = () => setGameState("ANNOUNCEMENT");

  useEffect(() => {
    switch (gameState) {
      case "STOPPED":
        break;

      case "LOST":
        // TODO: - SET DOM VISUAL ALARM
        //       - PLAY AUDIO ALARM
        //       - GOTO STATE "STOPPED" ONCE DONE
        break;
      case "ANNOUNCEMENT":
        setNewRange();
        resetLives();
        const announcementHandler = (dB) => {
          newEntry({ dB, hit: false, doesNotCount: true });
        };
        let announcementTimer = setCountdown(
          (timeLeft) => {
            setSecondsLeft(timeLeft);
          },
          () => {
            setGameState("RUNNING");
          },
          PREP_TIME
        );
        socket.on("rt_in", announcementHandler);
        return () => {
          socket.off("rt_in", announcementHandler);
          clearInterval(announcementTimer);
        };
      case "RUNNING":
        const gameHandler = (dB) => {
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
        socket.on("rt_in", gameHandler);
        return () => {
          socket.off("rt_in", gameHandler);
          clearInterval(roundTimer);
        };
    }
  }, [gameState, socket]);

  return {
    gameState,
    ...(gameState == "ANNOUNCEMENT" && { secondsLeft, lives, range }),
    ...(gameState == "RUNNING" && { secondsLeft, lives, range }),
    history,
    currentState: history[history.length - 1],
    maxLives: MAX_LIVES,
    startGame,
  };
}
