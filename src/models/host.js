class Host {
  #name = undefined;
  #address = undefined;
  #transferPort = undefined;

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
}

export { Host };
