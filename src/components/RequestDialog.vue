<template>
  <v-dialog v-model="open" width="min(60ch, 90%)" persistent>
    <v-card v-if="open">
      <v-card-text class="d-flex align-center justify-center">
        <div
          v-bind:class="{
            primary: true,
            logo: true,
            pulsing: !loading,
            stabilizing: loading,
          }"
        >
          <v-img src="../assets/logo.png" />
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <span v-if="loading">
          Waiting for <strong>{{ name }}</strong> to accept {{ files }} files...
        </span>
        <span v-else-if="sending">
          Sending {{ files }} files to <strong>{{ name }}</strong>
          ...
        </span>
        <span v-else>
          Receiving {{ files }} files from <strong>{{ name }}</strong>
          ...
        </span>

        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.logo {
  height: 8em;
  width: 8em;
  padding: 0.5em;
  margin: 3em;
  border-radius: 50%;
}

.stabilizing {
  animation: stabilize 2s infinite;
}

.pulsing {
  animation: pulse 2s infinite;
}

@keyframes stabilize {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 2em rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>

<script>
export default {
  name: "RequestDialog",

  data: () => ({
    open: false,
    loading: true,
    sending: true,
    name: undefined,
    files: undefined,
  }),

  methods: {
    start() {
      this.open = true;
    },
    stop() {
      this.open = false;
    },
    setLoading(loading) {
      this.loading = loading;
    },
    setSending(sending) {
      this.sending = sending;
    },
    setInfo({ name, files }) {
      this.name = name;
      this.files = files;
    },
  },
};
</script>
