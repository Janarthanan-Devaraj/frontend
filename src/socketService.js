import React, { useEffect, useContext } from "react";
import openSocket from "socket.io-client";
import { store } from "./stateManagement/store";
import { activeChatAction } from "./stateManagement/actions";

const SOCKET_URL = "https://api.onedev.co.in:2053/";

// const SOCKET_URL = "https://localhost:9000/";
let socket;

export const SocketService = () => {
  const {
    state: { userDetail },
    dispatch,
  } = useContext(store);

  const setupSocket = () => {
    socket = openSocket(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("command", (data) => {
      console.log("Received command from server:", data);
      if(!userDetail) return;
      if (userDetail.id !== data.receiver) return;
      dispatch({ type: activeChatAction, payload: true });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  useEffect(setupSocket, [userDetail]);

  return <></>;
};

const sendSocket = (data) => {
  socket.emit("command", {
    type: data.type,
    id: data?.id,
    content: data.content,
  })
}

export const sendTestSocket = (data) => {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }
  socket.emit("command", data);
  console.log(data);
};


export default SocketService;