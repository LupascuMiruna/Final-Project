const io = require("socket.io-client");

class SocketManager {
  constructor({ address = "http://localhost:3001", options = {} } = {}) {
    const connectOptions = Object.assign(options, { reconnect: true });
    this.socket = io.connect(address, connectOptions);
  }

  async init() {
    return new Promise((resolve) => {
      this.socket.on("connect", () => {
        console.log("Connected!");
        return resolve();
      });
    });
  }

  async parseExpression(expression) {
    return new Promise((resolve, reject) => {
      this.socket.emit("onParse", expression, (parsedData) => {
        if (!parsedData) {
          return reject(`Could not parse expression:\n ${expression}`);
        }
        return resolve(parsedData);
      });
    });
  }

  async initSubsribers(dispatcher) {
    this.socket.on("onMessage", (data) => {
      if(data.alternatives.length)
      {
        console.log(data);
        dispatcher.dispatch(data.alternatives, data.method, data.argvs);
      }
    });
  }
}

const socketManager = new SocketManager();
(async () => {
  await socketManager.init();
})();

module.exports = socketManager;
