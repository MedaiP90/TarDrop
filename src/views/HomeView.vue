<template>
  <div container>
    <div class="pa-4 y-scrollable" row>
      <TarDropUser
        v-for="(host, i) in hosts"
        v-bind:key="host.address + '-' + i"
        v-bind:host="host"
        v-on:click="selectHost(host)"
      />
    </div>

    <div v-if="selected !== undefined" class="my-4 px-4" grid>
      <h1 class="d-flex flex-row justify-space-between align-center">
        <span>
          Send files to <strong>{{ selected.name }}</strong>
        </span>

        <v-btn
          v-bind:title="'Close ' + selected.name"
          v-on:click="selected = undefined"
          color="error"
          icon
          text
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </h1>

      <div
        v-bind:class="{
          'chooser-container': files.length === 0,
          'chooser-border': true,
        }"
      >
        <v-btn
          v-if="files.length === 0"
          v-on:click.stop="selectFiles"
          color="primary"
          title="Add files"
          fab
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <div v-else class="chooser-list">
          <v-list>
            <v-list-item v-for="file in files" v-bind:key="file" link>
              <v-list-item-content>{{ file }}</v-list-item-content>

              <v-list-item-action>
                <v-btn
                  v-bind:title="'Remove ' + file"
                  v-on:click.stop="removeFile(file)"
                  color="error"
                  icon
                  text
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
      </div>

      <div buttons>
        <v-btn
          v-if="files.length > 0"
          v-on:click.stop="files = []"
          class="grow-1"
          color="error"
        >
          Remove all files
        </v-btn>

        <v-btn
          v-if="files.length > 0"
          v-on:click.stop="selectFiles"
          class="grow-1"
          color="primary"
        >
          Add more files
        </v-btn>

        <v-btn
          v-bind:disabled="files.length === 0"
          class="grow-2"
          color="primary"
        >
          Send files
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
div[container] {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

div[row] {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

div[grid] {
  display: grid;
  flex-grow: 1;
  gap: 1em;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr auto;
}

div[buttons] {
  display: flex;
  gap: 1em;
}

.grow-1 {
  flex-grow: 1;
}

.grow-2 {
  flex-grow: 2;
}

.y-scrollable {
  overflow-y: auto;
}

.chooser-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chooser-border {
  position: relative;
  border-radius: 1em;
  border: 1px solid #888888;
  overflow: hidden;
}

.chooser-list {
  position: absolute;
  overflow: auto;
  inset: 0;
}
</style>

<script>
import TarDropUser from "../components/TarDropUser";
import TarCommunicator from "../utils/t-com";
import portfinder from "portfinder";

export default {
  name: "HomeView",

  components: { TarDropUser },

  data: () => ({
    $tCom: undefined,
    hosts: [],
    files: [],
    selected: undefined,
  }),

  watch: {
    selected: {
      deep: true,
      handler(newSelected) {
        if (newSelected === undefined) this.files = [];
      },
    },
  },

  async beforeMount() {
    const tPort = await portfinder.getPortPromise();

    this.$tCom = new TarCommunicator(this.myName, tPort);

    // Setup listeners
    this.$tCom.on("newHost", this.addHost);
    this.$tCom.on("removedHost", this.removeHost);

    this.$tCom.start();

    // Give some time to go online
    setTimeout(() => {
      this.selfAnnounce();
    }, 1000);
  },

  beforeDestroy() {
    // Remove listeners
    this.$tCom.off("newHost", this.addHost);
    this.$tCom.off("removedHost", this.removeHost);

    this.$tCom.dispose();
  },

  methods: {
    selfAnnounce() {
      this.$tCom.sendHi();
    },
    addHost(host) {
      this.hosts.unshift(host);
    },
    removeHost(host) {
      this.hosts = this.hosts.filter((h) => h.address !== host.address);
    },
    selectHost(host) {
      this.selected = host;
    },
    selectFiles() {
      const fakeInput = document.createElement("input");

      fakeInput.type = "file";
      fakeInput.multiple = true;
      fakeInput.onchange = () => {
        for (
          let fileIndex = 0;
          fileIndex < fakeInput.files.length;
          fileIndex++
        ) {
          const newFile = fakeInput.files[fileIndex].path;

          if (this.files.includes(newFile)) continue;

          this.files.push(newFile);
        }
      };

      fakeInput.click();
    },
    removeFile(file) {
      this.files = this.files.filter((f) => f !== file);
    },
  },
};
</script>
