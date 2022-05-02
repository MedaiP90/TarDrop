const types = {
  HI: 0,
  T_REQUEST: 1,
  T_REPLY: 2,
  BYE: 3,
};

class BasePacket {
  #type = undefined;
  #name = undefined;

  constructor(type, name) {
    this.#type = type;
    this.#name = name;
  }

  static fromString(jsonString = "{}") {
    const json = JSON.parse(jsonString);

    return new BasePacket(json.type, json.name);
  }

  // Getters

  get type() {
    return this.#type;
  }
  get name() {
    return this.#name;
  }

  // Methods

  _toJson() {
    return { type: this.#type, name: this.#name };
  }
}

class HiPacket extends BasePacket {
  #transferPort = undefined;

  constructor({ name, tPort }) {
    super(types.HI, name);

    this.#transferPort = tPort;
  }

  static fromString(jsonString = "{}") {
    const json = JSON.parse(jsonString);

    return new HiPacket(json);
  }

  // Getters

  get transferPort() {
    return this.#transferPort;
  }

  // Methods

  toJson() {
    const base = this._toJson();

    base.tPort = this.#transferPort;

    return JSON.stringify(base);
  }
}

class ByePacket extends BasePacket {
  constructor({ name }) {
    super(types.BYE, name);
  }

  static fromString(jsonString = "{}") {
    const json = JSON.parse(jsonString);

    return new ByePacket(json);
  }

  // Methods

  toJson() {
    const base = this._toJson();

    return JSON.stringify(base);
  }
}

class TRequest extends BasePacket {
  #files = undefined;

  constructor({ name, files }) {
    super(types.T_REQUEST, name);

    this.#files = files;
  }

  static fromString(jsonString = "{}") {
    const json = JSON.parse(jsonString);

    return new TRequest(json);
  }

  // Getters

  get files() {
    return this.#files;
  }

  // Methods

  toJson() {
    const base = this._toJson();

    base.files = this.#files;

    return JSON.stringify(base);
  }
}

class TReply extends BasePacket {
  #reply = false;

  constructor({ name, reply }) {
    super(types.T_REPLY, name);

    this.#reply = reply;
  }

  static fromString(jsonString = "{}") {
    const json = JSON.parse(jsonString);

    return new TReply(json);
  }

  // Getters

  get reply() {
    return this.#reply;
  }

  // Methods

  toJson() {
    const base = this._toJson();

    base.reply = this.#reply;

    return JSON.stringify(base);
  }
}

class PacketFactory {
  static Build(jsonString) {
    const base = BasePacket.fromString(jsonString);

    switch (base.type) {
      case types.HI:
        return HiPacket.fromString(jsonString);
      case types.BYE:
        return ByePacket.fromString(jsonString);
      case types.T_REQUEST:
        return TRequest.fromString(jsonString);
      case types.T_REPLY:
        return TReply.fromString(jsonString);
      default:
        return undefined;
    }
  }
}

export {
  types,
  BasePacket,
  HiPacket,
  ByePacket,
  TRequest,
  TReply,
  PacketFactory,
};
