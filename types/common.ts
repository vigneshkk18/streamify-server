export interface Message {
  type: "create-room" | "join-room";
}

export interface Room {
  offer: RTCSessionDescription | null;
  answer: RTCSessionDescription | null;
}
