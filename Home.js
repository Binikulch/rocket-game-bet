import React, { useEffect } from "react";
import { connect } from "react-redux";
import RWS from "reconnecting-websocket";
// eslint-disable-next-line import/named
import { getTokenFromUrl, sendResponse } from "./helpers/general";
import { getFromStorage } from "./helpers/storageMenagement";
import App from "./App";
import {
  setRoundInfo,
  setOdd,
  setBetResponse,
  setGameBets,
  setCurrentMyBets,
  updateBetResponse,
  setCashOutData,
  setServerSeed,
} from "./redux/actions/roundActions";

import {
  setRoundsHistory,
  setGameState,
  setLeadersList,
  setMyBetsList,
  updateChatLikes,
  setPreviousGame,
  setBalance,
  setUserInfo,
  setChatHistory,
  updateChatHistory,
  setOnlineUsersCount,
  setErrors,
  setPopupActive,
  updateMyBetsList,
  setIsActiveManualSeed,
  setOptions,
  setManualSeed,
} from "./redux/actions/gameActions";
import { POPUPS } from "./constants/game";

const { ERRORS } = POPUPS;

export const socket = new RWS(
  `${window.engineURL}/socket?token=${getTokenFromUrl()}`
);

export const getRoundsHistory = () => {
  sendResponse(socket, "game:roundHistory", { limit: 100, offset: 0 });
};

export const getRoundData = (roundId) => {
  sendResponse(socket, "game:round", { roundId });
};

export const getLeaders = () => {
  sendResponse(socket, "game:leaders");
};

export const getNextServerSeed = () => {
  sendResponse(socket, "game:nextServerSeed");
};

export const betPlace = (betData) => {
  sendResponse(socket, "profile:betPlace", betData);
};

export const getMyBets = (data) => {
  sendResponse(socket, "profile:betsHistory", data);
};

export const getCurrentMyBets = () => {
  sendResponse(socket, "profile:bets");
};

export const betCancel = (betId) => {
  sendResponse(socket, "profile:betCancel", { bet_id: betId });
};

export const setServerAvatar = (data) => {
  sendResponse(socket, "profile:update", data);
};

export const betCashOut = (cashOutData) => {
  sendResponse(socket, "bet:checkOut", cashOutData);
};

export const setChatNewMessage = (data) => {
  sendResponse(socket, "chat:message", data);
};

export const setChatLike = (data) => {
  sendResponse(socket, "chat:update", data);
};

export const getBalance = () => {
  sendResponse(socket, "profile:balance");
};

export const getPreviousRound = () => {
  sendResponse(socket, "game:previousRound");
};

const Home = ({
  // eslint-disable-next-line no-shadow
  setGameState,
  setRoundsHistory,
  setRoundInfo,
  setOdd,
  setBetResponse,
  setGameBets,
  // eslint-disable-next-line no-shadow
  setLeadersList,
  setMyBetsList,
  setCurrentMyBets,
  setPreviousGame,
  setBalance,
  updateChatLikes,
  // eslint-disable-next-line no-shadow
  setUserInfo,
  updateBetResponse,
  setCashOutData,
  setServerSeed,
  setChatHistory,
  updateChatHistory,
  // eslint-disable-next-line no-shadow
  setOnlineUsersCount,
  setErrors,
  setPopupActive,
  updateMyBetsList,
  myBetsListReducer,
  // eslint-disable-next-line no-shadow
  setIsActiveManualSeed,
  activeOptionsReducer,
  setOptions,
  setManualSeed,
}) => {
  const setters = {
    "game:roundHistory": setRoundsHistory,
    "game:round": setRoundInfo,
    "game:state": setGameState,
    "game:odd": setOdd,
    "game:bets": setGameBets,
    "game:previousRound": setPreviousGame,
    "game:leaders": setLeadersList,
    "game:nextServerSeed": setServerSeed,
    "game:users": setOnlineUsersCount,
    "bet:checkOut": setCashOutData,
    "profile:betCancel": () => {
      getMyBets({ limit: 10, includeCurrentRound: true });
    },
    "profile:betPlace": setBetResponse,
    "profile:balance": setBalance,
    "profile:info": setUserInfo,
    "profile:update": (data) => console.log(data),
    "profile:betsHistory": setMyBetsList,
    "profile:bets": (data) => {
      updateMyBetsList(data);
      setCurrentMyBets(data);
    },
    "chat:history": setChatHistory,
    "chat:message": updateChatHistory,
    "chat:update": updateChatLikes,
  };
  socket.onopen = () => {
    getRoundsHistory();
    socket.binaryType = "arraybuffer";
    socket.onmessage = (event) => {
      const { data: pack } = event;
      const [topic, data] = JSON.parse(
        String.fromCharCode.apply(null, new Uint8Array(pack))
      );
      if (data.error) {
        setErrors(data.error);
        setPopupActive(ERRORS);
      } else {
        setters[topic](data);
      }
    };
  };

  useEffect(() => {
    window.parentStorage = [];
    getFromStorage("seedType");
    getFromStorage("manualSeed");
    getFromStorage("options");

    window.addEventListener("message", (e) => {
      let data;
      if (typeof e.data === "string") {
        data = JSON.parse(e.data);
      } else {
        data = e.data;
      }

      if (data.seedType) {
        const isActive = data.seedType.value === "manual";
        setIsActiveManualSeed(isActive);
      } else if (data.manualSeed) {
        data.manualSeed.value && setManualSeed(data.manualSeed.value);
      } else if (data.options) {
        const optionsParsed =
          JSON.parse(data.options.value) || activeOptionsReducer;
        setOptions(optionsParsed);
      }
    });
  }, []);
  return (
    <>
      <App />
    </>
  );
};

const mapStateToProps = ({ myBetsListReducer, activeOptionsReducer }) => ({
  myBetsListReducer,
  activeOptionsReducer,
});

const mapDispatchToProps = {
  setRoundsHistory,
  setRoundInfo,
  setOdd,
  setGameState,
  setBetResponse,
  setGameBets,
  setLeadersList,
  setMyBetsList,
  setCurrentMyBets,
  setPreviousGame,
  setBalance,
  setUserInfo,
  updateBetResponse,
  setCashOutData,
  setServerSeed,
  setChatHistory,
  updateChatHistory,
  updateChatLikes,
  setOnlineUsersCount,
  setErrors,
  setPopupActive,
  updateMyBetsList,
  setIsActiveManualSeed,
  setOptions,
  setManualSeed,
};
export default connect(mapStateToProps, mapDispatchToProps)(Home);
