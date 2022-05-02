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

  #hostList = [];

  #events = {
    newHost: [],
    removedHost: [],
    tRequest: [],
    tReply: [],
  };

  constructor(name, port) {
    this.#myName = name;
    this.#myPort = port;

    this.#server = new NetcatServer();
    this.#client = new NetcatClient();
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
    this.#initClient();
    this.#initServer();
  }

  dispose() {
    // Communicate to all known hosts that this node is leaving the network
    this.#hostList.forEach((host) => {
      this.#sendTo(
        host.address,
        new ByePacket({ name: this.#myName }).toJson()
      );
    });

    // Close all listeners
    if (this.#server) {
      this.#server.close();
      this.#server = undefined;
    }
    if (this.#client) {
      this.#client.close();
      this.#client = undefined;
    }
  }

  sendHi() {
    const splitted = this.#myIp.split(".");
    const subnet = `${splitted[0]}.${splitted[1]}.${splitted[2]}.`;

    for (let last = 1; last < 255; last++) {
      const hostToProbe = `${subnet}${last}`;

      if (process.env.NODE_ENV !== "production" || hostToProbe !== this.#myIp) {
        this.#sendTo(
          hostToProbe,
          new HiPacket({ name: this.#myName, tPort: this.#myPort }).toJson()
        );
      }
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
            if (this.#removeHost(host)) {
              // The host was actually removed: emit it
              this.#emit("removedHost", host);
            }

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

  #findHost(address) {
    return this.#hostList.findIndex((h) => h.address === address);
  }

  #addHost(newHost) {
    const notExists = this.#findHost(newHost.address) < 0;

    if (notExists) {
      this.#hostList.unshift(newHost);

      return true;
    }

    return false;
  }

  #removeHost(host) {
    const hostIndex = this.#findHost(host.address);

    this.#hostList.splice(hostIndex, 1);

    return hostIndex >= 0;
  }
}

export default TarCommunicator;
