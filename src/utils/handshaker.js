import NetcatServer from "netcat/server";
import NetcatClient from "netcat/client";
import Handshake from "../models/handshake";
import User from "../models/user";

class Handshaker {
  #port = 0;
  #myName = undefined;
  #myIp = undefined;

  #hsServer = undefined;
  #hsClient = undefined;

  #newUserCallback = () => {};

  constructor(port, myName, myIp) {
    this.#port = port;
    this.#myName = myName;
    this.#myIp = myIp;
    this.#hsServer = new NetcatServer();
    this.#hsClient = new NetcatClient();
  }

  init(newUserCallback = () => {}) {
    this.#newUserCallback = newUserCallback;
    this.#initClient();
    this.#initServer();
  }

  sendProbe(host) {
    this.#reply(host, JSON.stringify({ type: Handshake.type.PROBE }));
  }

  dispose() {
    if (this.#hsServer) {
      this.#hsServer.close();
      this.#hsServer = undefined;
    }
    if (this.#hsClient) {
      this.#hsClient.close();
      this.#hsClient = undefined;
    }
  }

  #initServer() {
    this.#hsServer
      .udp()
      .port(this.#port)
      .k()
      .listen()
      .on("data", ({ address }, data) => {
        const packet = new Handshake(data.toString());

        switch (packet.type) {
          case Handshake.type.PROBE: {
            this.#reply(
              address,
              JSON.stringify({
                type: Handshake.type.PRESENTATION,
                message: JSON.stringify(new User(this.#myName, this.#myIp)),
              })
            );
            break;
          }
          case Handshake.type.PRESENTATION: {
            const user = new User(
              packet?.message.name,
              packet?.message.address
            );

            this.#newUserCallback(user);

            break;
          }
          default: {
            break;
          }
        }
      });
  }

  #initClient() {
    this.#hsClient.udp().port(this.#port).init();
  }

  #reply(host, data) {
    this.#hsClient.send(data, host);
  }
}

export default Handshaker;
