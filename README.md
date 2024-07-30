# WebRTC-Signaling-Server

This project provides a WebRTC signaling server built with Node.js and Socket.IO to facilitate peer-to-peer (P2P) handshakes between devices. It supports both one-to-one and many-to-many connections.

### Tech Stack
* Server Framework: Express.js
* Websocket Library: Socket.IO

### Project Goals
* Act as a central hub for establishing P2P connections between devices using WebRTC.
* Facilitate both one-on-one and multi-party communication scenarios.

### Installation
1. Clone this repository:
   
   ```bash
   git clone https://github.com/vigneshkk18/webrtc-signaling-server.git
   ```

2. Install dependencies:
   
   ```bash
   npm install
   ```

3. Running the server:
   
   ```bash
   npm run dev
   ```
   
### Usage

The server utilizes two namespaces for handling different types of handshakes:

* **/one-to-one:** Used for establishing a single peer-to-peer connection between two devices.
* **/many-to-many:** Enables a connection between multiple devices, forming a multi-party communication channel.

**Note:** To use this server with your WebRTC application, you'll need to integrate the socket.io client library and implement logic within your application to connect to the respective namespaces based on your desired communication mode.

