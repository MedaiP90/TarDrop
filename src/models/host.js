class Host {
  #name = undefined;
  #address = undefined;
  #transferPort = undefined;
  #timestamp = 0;

  constructor(name, address, tPort) {
    this.#name = name;
    this.#address = address;
    this.#transferPort = tPort;
  }

  // Getters

  get name() {
    return this.#name;
  }
  get address() {
    return this.#address;
  }
  get transferPort() {
    return this.#transferPort;
  }
  get timestamp() {
    return this.#timestamp;
  }

  // Setters

  set timestamp(timestamp) {
    this.#timestamp = timestamp;
  }
}

export { Host };
