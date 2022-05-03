<template>
  <div
    v-bind:title="
      host !== undefined
        ? 'Click to select'
        : 'Waiting for other hosts to be online'
    "
    v-on:click="emitClick"
    class="pa-2"
    col
    hover
  >
    <v-avatar
      v-bind:class="{
        primary: true,
        pulsing: host !== undefined,
        stabilizing: host === undefined,
      }"
    >
      <v-img src="../assets/logo.png" />
    </v-avatar>
    <template v-if="host !== undefined">
      <div class="body-1 font-weight-bold mt-1">{{ host.name }}</div>
      <div class="caption grey--text">{{ host.address }}</div>
    </template>
    <template v-else>
      <div class="body-1 font-weight-bold mt-1">...</div>
      <div class="caption grey--text">Waiting</div>
    </template>
  </div>
</template>

<style scoped>
div[col] {
  display: flex;
  flex-direction: column;
  align-items: center;
}

div[col] > div {
  line-height: 1rem;
}

div[hover]:hover {
  cursor: pointer;
  border-radius: 1em;
  box-shadow: 0 0 1em 1px #24292b50;
}

div[hover]:active {
  background-color: #24292b25;
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
    box-shadow: 0 0 0 0.5em rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>

<script>
export default {
  name: "TarDropUser",

  props: {
    host: { type: Object, required: false },
  },

  methods: {
    emitClick(event) {
      this.$emit("click", event);
    },
  },
};
</script>
