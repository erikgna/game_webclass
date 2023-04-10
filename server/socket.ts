import { Server } from "socket.io";

enum SocketStatics {
  CONNECTION = "connection",
  ON_CONNECTION = "onConnection",
  // CONNECTION = "connection"
}

const io = new Server({
  cors: {
    origin: "https://forca.erikna.com",
  },
});

io.on(SocketStatics.CONNECTION, (socket) => {
  socket.on(SocketStatics.ON_CONNECTION, () => {});
});
