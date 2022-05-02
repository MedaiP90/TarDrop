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
          v-on:click="sendFilesRequest"
          class="grow-2"
          color="primary"
        >
          Send files
        </v-btn>
      </div>
    </div>

    <RequestDialog
      v-bind:name="selected ? selected.name : undefined"
      v-bind:files="files.length"
      ref="requestDialog"
    />

    <AcceptDialog v-on:t-reply="transferReply" ref="acceptDialog" />
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
import RequestDialog from "../components/RequestDialog";
import AcceptDialog from "../components/AcceptDialog";
import TarCommunicator from "../utils/t-com";
import portfinder from "portfinder";
import { FileChooser } from "../utils/file-chooser";

export default {
  name: "HomeView",

  components: { TarDropUser, RequestDialog, AcceptDialog },

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
    this.$tCom.on("tRequest", this.onTransferRequest);
    this.$tCom.on("tReply", this.onTransferReply);

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
    this.$tCom.off("tRequest", this.onTransferRequest);
    this.$tCom.off("tReply", this.onTransferReply);

    this.$tCom.dispose();
  },

  methods: {
    getRequestDialog() {
      return this.$refs.requestDialog;
    },
    getAcceptDialog() {
      return this.$refs.acceptDialog;
    },
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
      FileChooser.open(true, false, (input) => {
        for (let fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
          const newFile = input.files[fileIndex].path;

          if (this.files.includes(newFile)) continue;

          this.files.push(newFile);
        }
      });
    },
    removeFile(file) {
      this.files = this.files.filter((f) => f !== file);
    },
    sendFilesRequest() {
      this.getRequestDialog().setLoading(true);
      this.getRequestDialog().start();
      this.$tCom.sendTransferRequest(this.selected.address, this.files.length);
    },
    transferReply({ host, response }) {
      let callback = undefined;

      if (response) {
        callback = () => {
          console.log(`TODO: Receiving from ${host.name}`);
        };
      }

      this.$tCom.sendTransferReply(host.address, callback);
    },
    onTransferRequest({ host, files }) {
      this.getAcceptDialog().setData(host, files);
      this.getAcceptDialog().open();
    },
    onTransferReply({ host, reply }) {
      this.getRequestDialog().setLoading(false);

      if (!reply) return this.getRequestDialog().stop();

      console.log(`TODO: Sending to ${host.name}`);
    },
  },
};
</script>
