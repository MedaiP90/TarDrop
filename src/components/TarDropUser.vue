<template>
  <div class="pa-2" col hover>
    <v-avatar class="primary">
      <v-img src="../assets/logo.png" />
    </v-avatar>
    <div class="body-1 font-weight-bold mt-1">{{ user.name }}</div>
    <div class="caption grey--text">{{ user.address }}</div>
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
</style>

<script>
export default {
  name: "TarDropUser",

  props: {
    user: { type: Object, required: true },
  },
};
</script>
