import React, { useState, useEffect } from "react";
import "./assets/sass/style.scss";
import { connect, useSelector } from "react-redux";
import { getGameState } from "./Home";
import Menu from "./components/Menu/Menu";
// eslint-disable-next-line import/no-cycle
import Main from "./components/Main/Main";
import {
  setOdd,
  setBetData,
  setResetGameBets,
} from "./redux/actions/roundActions";
// eslint-disable-next-line import/named
import { detectRocketBrowser, generateSeed } from "./helpers/general";
import sounds from "./assets/sounds";
// eslint-disable-next-line import/named
import {
  setRandomSeed,
  setRoundsHistory,
  setIsActiveManualSeed,
} from "./redux/actions/gameActions";
import Landscape from "./Landscape";
import { useScrollDisable } from "./hooks/useScrollDisable";
// eslint-disable-next-line no-shadow
function App({
  // eslint-disable-next-line no-shadow
  gameState,
  setCurrentOdd,
  setRandomSeed,
  soundDataReducer,
  setResetGameBets,
  // eslint-disable-next-line no-shadow
  roundsHistory,
  activeOptions,
  setRoundsHistory,
}) {
  const popups = useSelector((state) => state.popupReducer);
  const [styles, setStyles] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [rocketBrowser, setRocketBrowser] = useState("");
  const [iFrameMusicIsActive, setIFrameMusicIsActive] = useState(false);
  const [isSoundsOn, setIsSoundsOn] = useState(false);
  const [hoverMusic, setHoverMusic] = useState(false);
  // const [ landscapeAccepted, setLandscapeAccepted ] = useState(window.innerHeight > window.innerWidth);

  const [isVerticalMode, setisVerticalMode] = useState(
    () => window.orientation === 0
  );

  useEffect(() => {
    const changeOrientation = () => {
      setisVerticalMode(window.orientation === 0);
    };
    window.addEventListener("orientationchange", changeOrientation);

    return () => {
      window.removeEventListener("orientationchange", changeOrientation);
    };
  }, []);

  const {
    round_id: roundId,
    is_started: isStarted,
    is_crashed: isCrashed,
    launch_time: launchTime,
    server_time: serverTime,
  } = gameState;

  // useEffect(() => {
  //   console.log('aaaaa', window.innerHeight, window.innerWidth, window.matchMedia('(orientation: portrait)').matches )
  //   if (window.matchMedia('(orientation: portrait)').matches) {
  //     setLandscapeAccepted(true);
  //   } else {
  //     setLandscapeAccepted(false);
  //   }
  // }, [ window.innerHeight, window.innerWidth ]);

  const updateRoundsHistory = (gameData) => {
    const dataCopy = [gameData, ...roundsHistory];
    dataCopy.pop();
    setRoundsHistory(dataCopy);
  };

  useEffect(() => {
    const diff = (launchTime - serverTime) / 1000;
    setStartTime(diff);
  }, [roundId, activeOptions.rocket]);

  useEffect(() => {
    setRandomSeed(generateSeed(20));
  }, [roundId]);

  useEffect(() => {
    // sounds & music
    const optionsParsed = activeOptions;
    setIFrameMusicIsActive(optionsParsed.music);
    setIsSoundsOn(optionsParsed.sound);
  }, [soundDataReducer]);

  useEffect(() => {
    const rBrowser = detectRocketBrowser();
    setRocketBrowser(rBrowser);
  }, []);

  useEffect(() => {
    if (isSoundsOn) {
      const rocketCrashAudio = document.getElementsByClassName(
        "rocket-crash-audio-element"
      )[0];
      const rocketStartAudio = document.getElementsByClassName(
        "rocket-start-audio-element"
      )[0];
      soundDataReducer.rocketCrashed && rocketCrashAudio.play();
      soundDataReducer.rocketStart &&
        !soundDataReducer.rocketCrashed &&
        rocketStartAudio.play();
    }
  }, [soundDataReducer.rocketStart, soundDataReducer.rocketCrashed]);

  useEffect(() => {
    if (isSoundsOn) {
      const rocketBetAudio = document.getElementsByClassName(
        "rocket-bet-audio-element"
      )[0];
      rocketBetAudio.play();
    }
  }, [soundDataReducer.betButton]);

  useEffect(() => {
    if (isStarted === false && isCrashed === false) {
      setResetGameBets({});
      setCurrentOdd({ current_odd: "" });
      setStyles((prev) => {
        if (prev === "start") {
          return "start";
        }
        setStyles("");
        setTimeout(() => {
          setStyles("start");
        }, 0);
      });
    } else if (isStarted === true && isCrashed === false) {
      if (activeOptions.rocket) {
        setTimeout(() => {
          setStyles("start background-fast loading-end");
        }, 0);
      } else {
        setTimeout(() => {
          setStyles("start loading-end");
        }, 0);
      }
    } else if (isStarted === true && isCrashed === true) {
      if (activeOptions.rocket) {
        setTimeout(() => {
          setStyles("start end animation");
        }, 0);
      } else {
        setTimeout(() => {
          setStyles("start end");
        }, 0);
      }
      const { crash_value: crashValue } = gameState;
      const gameData = { id: roundId, crash_value: crashValue };
      updateRoundsHistory(gameData);
      setCurrentOdd({ current_odd: crashValue });
    }
  }, [isStarted, isCrashed, activeOptions.rocket]);

  useEffect(() => {
    const listener = () => {
      if (document.visibilityState === "visible") {
        const date = new Date().getTime();
        const diff = (launchTime - date) / 1000 + 0.7;
        setStartTime(diff);
      } else {
        setStartTime(0);
      }
    };
    document.addEventListener("visibilitychange", listener);
    // eslint-disable-next-line no-restricted-globals
    return () => removeEventListener("visibilitychange", listener);
  }, [launchTime]);

  useScrollDisable(Object.values(popups).includes(true), [popups]);

  return (
    <>
      {isVerticalMode && (
        <div
          onClick={() => setHoverMusic(true)}
          className={`crazy-rocket ${styles}`}
          style={{ "--animationTime": `${startTime}s` }}
        >
          <Main startTime={startTime} setStartTime={setStartTime} />
          <Menu />
          <div>
            {iFrameMusicIsActive && rocketBrowser === "isChrome" && hoverMusic && (
              <audio id="rocket-music-audio-element" autoPlay loop>
                <source src={sounds.rocketMusic} type="audio/mp3" />
              </audio>
            )}
            {iFrameMusicIsActive && !(rocketBrowser === "isChrome") && (
              <audio id="rocket-music-audio-element" autoPlay loop>
                <source src={sounds.rocketMusic} type="audio/mp3" />
              </audio>
            )}

            {isSoundsOn && (
              <div>
                <audio className="rocket-start-audio-element">
                  <source src={sounds.rocketStart} />
                </audio>
                <audio className="rocket-crash-audio-element">
                  <source src={sounds.rocketCrash} />
                </audio>
                <audio className="rocket-bet-audio-element">
                  <source src={sounds.rocketBet} />
                </audio>
              </div>
            )}
          </div>
        </div>
      )}
      {!isVerticalMode && <Landscape />}
    </>
  );
}

const mapStateToProps = ({
  gameStateReducer,
  randomSeedReducer,
  roundsHistoryReducer,
  betResponseReducer,
  activeOptionsReducer,
  soundDataReducer,
}) => ({
  gameState: gameStateReducer,
  randomSeedReducer,
  roundsHistory: roundsHistoryReducer,
  betResponseReducer,
  activeOptions: activeOptionsReducer,
  soundDataReducer,
});

const mapDispatchToProps = {
  setCurrentOdd: setOdd,
  setRandomSeed,
  setIsActiveManualSeed,
  setBetData,
  setResetGameBets,
  setRoundsHistory,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
