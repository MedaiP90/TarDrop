<template>
  <div container>
    <div class="pa-4 y-scrollable" row shadow>
      <template v-if="hosts.length > 0">
        <TarDropUser
          v-for="(host, i) in hosts"
          v-bind:key="host.address + '-' + i"
          v-bind:host="host"
          v-on:click="selectHost(host)"
        />
      </template>
      <template v-else>
        <TarDropUser />
      </template>
    </div>

    <div class="my-4 px-4" grid>
      <h1 class="d-flex flex-row justify-space-between align-center">
        <span v-if="selected !== undefined">
          Send files to <strong>{{ selected.name }}</strong>
        </span>
        <span v-else>Select a receiver from above</span>

        <v-btn
          v-if="selected !== undefined"
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
          <v-icon x-large>mdi-plus</v-icon>
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
          v-bind:disabled="selected === undefined || files.length === 0"
          v-on:click="sendFilesRequest"
          class="grow-2"
          color="primary"
        >
          Send files
        </v-btn>
      </div>
    </div>

    <RequestDialog ref="requestDialog-send" />

    <RequestDialog ref="requestDialog-receive" />

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

div[shadow] {
  box-shadow: 0 0 0.7em 0 #24292b50;
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
import Transfer from "../utils/transfer";
import portfinder from "portfinder";
import { FileChooser } from "../utils/file-chooser";

const SEND = "send";
const RECEIVE = "receive";

export default {
  name: "HomeView",

  components: { TarDropUser, RequestDialog, AcceptDialog },

  data: () => ({
    $tCom: undefined,
    $transfer: undefined,
    hosts: [],
    files: [],
    selected: undefined,
    hasErrors: false,
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
    this.$transfer = new Transfer(this.netcatCommand);

    this.$bus.$on("disconnect", this.disconnect);
    this.$bus.$on("connect", this.connect);

    // Setup listeners
    this.$tCom.on("newHost", this.addHost);
    this.$tCom.on("removedHost", this.removeHost);
    this.$tCom.on("tRequest", this.onTransferRequest);
    this.$tCom.on("tReply", this.onTransferReply);
    this.$transfer.on("sendDone", this.sendDone);
    this.$transfer.on("receiveDone", this.receiveDone);
    this.$transfer.on("receiveError", this.receiveError);

    this.connect();
  },

  beforeDestroy() {
    this.disconnect();

    this.$bus.$off("disconnect", this.disconnect);
    this.$bus.$off("connect", this.connect);

    // Remove listeners
    this.$tCom.off("newHost", this.addHost);
    this.$tCom.off("removedHost", this.removeHost);
    this.$tCom.off("tRequest", this.onTransferRequest);
    this.$tCom.off("tReply", this.onTransferReply);
    this.$transfer.off("sendDone", this.sendDone);
    this.$transfer.off("receiveDone", this.receiveDone);
    this.$transfer.off("receiveError", this.receiveError);
  },

  methods: {
    connect() {
      this.$tCom.start();
    },
    disconnect() {
      this.$tCom.dispose();
    },
    getRequestDialog(type) {
      return this.$refs[`requestDialog-${type}`];
    },
    getAcceptDialog() {
      return this.$refs.acceptDialog;
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
      this.getRequestDialog(SEND).setLoading(true);
      this.getRequestDialog(SEND).setSending(true);
      this.getRequestDialog(SEND).setInfo({
        name: this.selected?.name,
        files: this.files.length,
      });
      this.getRequestDialog(SEND).start();
      this.$tCom.sendTransferRequest(this.selected.address, this.files.length);
    },
    transferReply({ host, response, files }) {
      let callback = undefined;

      if (response) {
        callback = () => {
          this.getRequestDialog(RECEIVE).setLoading(false);
          this.getRequestDialog(RECEIVE).setSending(false);
          this.getRequestDialog(RECEIVE).setInfo({ name: host.name, files });
          this.getRequestDialog(RECEIVE).start();

          this.$transfer.receiveFrom(
            this.$tCom.info.port,
            host,
            this.myDownload,
            this.uncompressData
          );
        };
      }

      this.$tCom.sendTransferReply(host.address, callback);
    },
    onTransferRequest({ host, files }) {
      this.getAcceptDialog().setData(host, files);
      this.getAcceptDialog().open();
    },
    onTransferReply({ host, reply }) {
      this.getRequestDialog(SEND).setLoading(false);

      if (!reply) return this.getRequestDialog(SEND).stop();

      this.$transfer.sendTo(host, this.files, this.flattenStructure);
    },
    sendDone({ error }) {
      this.getRequestDialog(SEND).stop();

      if (error) {
        this.$bus.$emit("error", `Transfer completed with error: ${error}`);
      } else {
        this.$bus.$emit("message", "Transfer completed successfully");
      }
    },
    receiveDone() {
      this.getRequestDialog(RECEIVE).stop();

      if (!this.hasErrors) {
        this.$bus.$emit("message", "Transfer completed successfully");
      } else {
        this.$bus.$emit("error", "Transfer completed with errors");
      }

      this.hasErrors = false;
    },
    receiveError({ error }) {
      this.hasErrors = true;
      this.$bus.$emit("error", `Error: ${error}`);
    },
  },
};
</script>
