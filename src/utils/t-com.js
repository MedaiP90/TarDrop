import NetcatServer from "netcat/server";
import NetcatClient from "netcat/client";
import ip from "ip";
import { Host } from "@/models/host";
import { Constants } from "./constants";
import {
  PacketFactory,
  HiPacket,
  ByePacket,
  TRequest,
  TReply,
} from "@/models/packets";

class TarCommunicator {
  #myIp = ip.address();
  #myPort = undefined;
  #myName = undefined;

  #server = undefined;
  #client = undefined;
  #keepAlive = undefined;
  #clearGhosts = undefined;

  #hostList = [];

  #events = {
    newHost: [],
    removedHost: [],
    tRequest: [],
    tReply: [],
    fin: [],
  };

  constructor(name, port) {
    this.#myName = name;
    this.#myPort = port;
  }

  // Getters

  get info() {
    return { ip: this.#myIp, port: this.#myPort, name: this.#myName };
  }

  // Methods

  on(event, listener) {
    this.#events[event]?.push(listener);
  }

  off(event, listener) {
    if (event in this.#events) {
      this.#events[event] = this.#events[event].filter((l) => l !== listener);
    }
  }

  start() {
    this.#server = new NetcatServer();
    this.#client = new NetcatClient();

    this.#initClient();
    this.#initServer();

    // Announce itself to the network or update
    // already established connections
    this.#keepAlive = setInterval(() => {
      this.sendHi();
    }, Constants.APP_KEEPALIVE);
    // Clear ghost hosts
    this.#clearGhosts = setInterval(() => {
      const now = new Date().getTime();

      this.#hostList.forEach((host) => {
        if (now - host.timestamp > Constants.APP_KEEPALIVE * 2) {
          this.#onByePacket(host);
        }
      });
    }, Constants.APP_KEEPALIVE * 2.1);
  }

  dispose() {
    if (this.#keepAlive) {
      clearInterval(this.#keepAlive);
      this.#keepAlive = undefined;
    }

    if (this.#clearGhosts) {
      clearInterval(this.#clearGhosts);
      this.#clearGhosts = undefined;
    }

    // Communicate to all known hosts that this node is leaving the network
    this.#hostList.forEach((host) => {
      this.#sendTo(
        host.address,
        new ByePacket({ name: this.#myName }).toJson()
      );
    });

    // Await for messages to be sent
    // then close all listeners
    setTimeout(() => {
      if (this.#server) {
        this.#server.close();
        this.#server = undefined;
      }
      if (this.#client) {
        this.#client.close();
        this.#client = undefined;
      }
    }, 500 * this.#hostList.length);
  }

  sendHi() {
    const splitted = this.#myIp.split(".");
    const subnet = `${splitted[0]}.${splitted[1]}.${splitted[2]}.`;

    const send = (hostToProbe) => {
      if (process.env.NODE_ENV !== "production" || hostToProbe !== this.#myIp) {
        this.#sendTo(
          hostToProbe,
          new HiPacket({ name: this.#myName, tPort: this.#myPort }).toJson()
        );
      }
    };

    if (this.#hostList.length === 0) {
      for (let last = 1; last < 255; last++) {
        send(`${subnet}${last}`);
      }
    } else {
      this.#hostList.forEach((host) => {
        send(host.address);
      });
    }
  }

  sendTransferRequest(address, filesCount) {
    const hostIndex = this.#findHost(address);

    if (hostIndex < 0) return hostIndex;

    this.#sendTo(
      address,
      new TRequest({ name: this.#myName, files: filesCount }).toJson()
    );

    return hostIndex;
  }

  sendTransferReply(address, callback = undefined) {
    const hostIndex = this.#findHost(address);

    if (hostIndex < 0) return hostIndex;

    // Execute callback if exists
    callback?.();
    // If a callback exists the reply is positive
    this.#sendTo(
      address,
      new TReply({ name: this.#myName, reply: callback !== undefined }).toJson()
    );

    return hostIndex;
  }

  // Private methods

  #initClient() {
    this.#client.udp().port(Constants.APP_COM_PORT).init();
  }

  #initServer() {
    this.#server
      .udp()
      .port(Constants.APP_COM_PORT)
      .k()
      .listen()
      .on("data", ({ address }, data) => {
        const packet = PacketFactory.Build(data.toString());
        const host = new Host(packet.name, address, packet.transferPort);

        host.timestamp = new Date().getTime();

        switch (packet.constructor) {
          case HiPacket: {
            if (this.#addHost(host)) {
              // It is actually a new host: emit it
              this.#emit("newHost", host);

              // Send a greeting
              this.#sendTo(
                address,
                new HiPacket({
                  name: this.#myName,
                  tPort: this.#myPort,
                }).toJson()
              );
            }

            break;
          }
          case ByePacket: {
            this.#onByePacket(host);

            break;
          }
          case TRequest: {
            // Emit the host
            this.#emit("tRequest", { host, files: packet.files });
            break;
          }
          case TReply: {
            // Emit the host and its response
            this.#emit("tReply", {
              host: this.#hostList[this.#findHost(host.address)],
              reply: packet.reply,
            });
            break;
          }
          default:
            break;
        }
      });
  }

  #emit(event, data) {
    this.#events[event]?.forEach((listener) => listener(data));
  }

  #sendTo(host, data) {
    this.#client.send(data, host);
  }

  #onByePacket(host) {
    if (this.#removeHost(host)) {
      // The host was actually removed: emit it
      this.#emit("removedHost", host);
    }
  }

  #findHost(address) {
    return this.#hostList.findIndex((h) => h.address === address);
  }

  #addHost(newHost) {
    const host = this.#findHost(newHost.address);

    if (host < 0) {
      this.#hostList.unshift(newHost);
    } else {
      this.#hostList[host].timestamp = newHost.timestamp;
    }

    return host < 0;
  }

  #removeHost(host) {
    const hostFound = this.#findHost(host.address) >= 0;

    if (hostFound) {
      this.#hostList = this.#hostList.filter((h) => h.address !== host.address);
    }

    return hostFound;
  }
}

export default TarCommunicator;
