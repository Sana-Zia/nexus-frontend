
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

export default function VideoCall() {

  useEffect(() => {
    socket.emit("join-room", "demo-room");
  }, []);

  return (
    <div>
      <h2>Video Call</h2>
      <p>Connected to signaling server</p>
    </div>
  );
}
