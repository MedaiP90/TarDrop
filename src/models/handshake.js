class Handshake {
  static type = {
    PROBE: 0,
    PRESENTATION: 1,
  };

  type = undefined;
  message = undefined;

  constructor(jsonStrong = "{}") {
    const json = JSON.parse(jsonStrong);

    this.type = json.type;
    this.message = JSON.parse(json.message || "{}");
  }
}

export default Handshake;
