<template>
  <div>
    <div class="pa-4 y-scrollable" row>
      <TarDropUser
        v-for="(user, i) in foundUsers"
        v-bind:key="user.address + '-' + i"
        v-bind:user="user"
      />
    </div>
  </div>
</template>

<style scoped>
div[row] {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.y-scrollable {
  overflow-y: auto;
}
</style>

<script>
import Constants from "../utils/constants";
// import { spawn } from "child_process";
import Handshaker from "../utils/handshaker";
import TarDropUser from "../components/TarDropUser";

export default {
  name: "HomeView",

  components: { TarDropUser },

  data: () => ({
    handshaker: undefined,
    foundUsers: [],
    prober: undefined,
  }),

  beforeMount() {
    this.handshaker = new Handshaker(
      Constants.APP_COM_PORT,
      this.myName,
      this.myAddress
    );

    this.handshaker.init((newUser) => {
      if (!this.userScanned(newUser)) {
        this.foundUsers.push(newUser);
      }
    });

    this.scanLan();

    this.prober = setInterval(this.scanLan, 1_000);
  },

  // mounted() {
  //   const com = spawn("tar", ["czf", "-", "/home/leonardo/bash_settings_copy"]);

  //   com.stdout.on("data", (data) => {
  //     console.error(String(data));
  //   });

  //   com.stderr.on("data", (data) => {
  //     console.error(String(data));
  //   });

  //   com.on("close", (code) => {
  //     console.log(`Communication exited with code: ${code}`);
  //   });
  // },

  beforeDestroy() {
    this.handshaker.dispose();

    if (this.prober) {
      clearInterval(this.prober);
      this.prober = undefined;
    }
  },

  methods: {
    userScanned(search) {
      // eslint-disable-next-line prettier/prettier
      return this.foundUsers.findIndex((user) => user.address === search.address) >= 0;
    },
    scanLan() {
      const ipParts = this.myAddress.split(".");
      const part = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;

      for (let host = 2; host < 255; host++) {
        const complete = `${part}${host}`;

        if (
          process.env.NODE_ENV !== "production" ||
          complete !== this.myAddress
        ) {
          this.handshaker.sendProbe(complete);
        }
      }
    },
  },
};
</script>
