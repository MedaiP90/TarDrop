<template>
  <v-snackbar
    v-model="snackbar"
    v-bind:color="isError ? 'error' : 'success'"
    centered
  >
    {{ message }}

    <template v-slot:action="{ attrs }">
      <v-btn v-bind="attrs" v-on:click="snackbar = false" icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: "MessageToast",

  data: () => ({
    snackbar: false,
    message: "",
    isError: false,
  }),

  methods: {
    setOpen(open) {
      this.snackbar = open;
    },
    setMessage(msg) {
      this.message = msg;
    },
    setError(isError) {
      this.isError = isError;
    },
  },
};
</script>
