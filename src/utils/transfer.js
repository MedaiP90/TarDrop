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

  receiveFrom(myPort, toFolder) {
    exec(
      `nc -l -p ${myPort} | tar -C ${toFolder} -xvz`,
      (err, stdout, stderr) => {
        this.#emit("receiveDone");

        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }
    );
  }

  sendTo(host, files) {
    exec(
      // eslint-disable-next-line prettier/prettier
      `tar -cvzf - ${files.join(" ")} | nc ${host.address} ${host.transferPort}`,
      (err, stdout, stderr) => {
        this.#emit("sendDone");

        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      }
    );
  }

  #emit(event, data) {
    this.#events[event]?.forEach((listener) => listener(data));
  }
}

export default Transfer;
