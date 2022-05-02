import { exec } from "child_process";

class Transfer {
  #events = {
    receiveDone: [],
    sendDone: [],
  };

  on(event, listener) {
    this.#events[event]?.push(listener);
  }

  off(event, listener) {
    if (event in this.#events) {
      this.#events[event] = this.#events[event].filter((l) => l !== listener);
    }
  }

  receiveFrom(myPort, host, toFolder, uncompressData = true) {
    const tmp = `${toFolder}/${host.name}-${new Date().getTime()}.tar.gz`;
    let tar = `> ${tmp}`;

    if (uncompressData) {
      tar = `| tar -C ${toFolder} -xz`;
    }

    const command = exec(`nc -l -p ${myPort} ${tar}`);

    command.stdout.on("data", (data) => {
      console.info(`stdout: ${data}`);
    });
    command.stderr.on("data", (error) => {
      console.info(`stderr: ${error}`);
    });
    command.on("close", () => {
      this.#emit("receiveDone");
    });
  }

  sendTo(host, files) {
    exec(
      // eslint-disable-next-line prettier/prettier
      `tar --transform 's/.*\\///g' -czf - ${files.map((f) => `'${f}'`).join(" ")} | nc -c ${host.address} ${host.transferPort}`,
      (error) => {
        if (error) console.error("Sending error:", error);
        this.#emit("sendDone", { error });
      }
    );
  }

  #emit(event, data) {
    this.#events[event]?.forEach((listener) => listener(data));
  }
}

export default Transfer;
