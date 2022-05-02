<template>
  <v-dialog v-model="acceptDialog" width="unset" persistent>
    <v-card v-if="acceptDialog">
      <v-card-title>Transfer request</v-card-title>

      <v-card-text>
        <strong>{{ host ? host.name : undefined }}</strong> wants to send you
        {{ filesCount }} files. Do you want to accept?
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn v-on:click="respond(false)" color="error" text>Deny</v-btn>
        <v-btn v-on:click="respond(true)" color="primary" text>Accept</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AcceptDialog",

  data: () => ({
    acceptDialog: false,
    host: undefined,
    filesCount: undefined,
  }),

  methods: {
    open() {
      this.acceptDialog = true;
    },
    close() {
      this.acceptDialog = false;
    },
    setData(host, count) {
      this.host = host;
      this.filesCount = count;
    },
    respond(response) {
      this.$emit("t-reply", { host: this.host, response });
      this.acceptDialog = false;
    },
  },
};
</script>
