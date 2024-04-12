// server.js
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
const WebSocket = require('ws');
require('dotenv').config()
const DEEPGRAM_API_KEY = "43b551846f6be3e0b9ab06ed291e5ebf8674434e";
// const PORT = process.env.PORT
const wss = new WebSocket.Server({ port: process.env.PORT });

wss.on('connection', (ws) => {
 const deepgram = createClient(DEEPGRAM_API_KEY);
 let connection;

 const openConnection = () => {
    connection = deepgram.listen.live({
      model: "nova-2",
      language: "en-US",
      smart_format: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log("Deepgram connection opened.");
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      console.log(data.channel.alternatives, "data.channel.alternatives")
      ws.send(JSON.stringify({ type: 'transcript', data: transcript }));
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log("Deepgram connection closed.");
      // Implement retry logic here if needed
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error("Deepgram connection error:", err);
      // Implement error handling and retry logic here
    });
 };

 ws.on('message', (message) => {
    if (message.length > 0 && connection) {
      connection.send(message);
    }
 });

 ws.on('close', () => {
    console.log("Client WebSocket connection closed.");
    // Implement cleanup logic here
 });

 openConnection();
});
