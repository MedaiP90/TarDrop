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
import TarDropUser from "../components/TarDropUser";

export default {
  name: "HomeView",

  components: { TarDropUser },

  data: () => ({
    foundUsers: [],
  }),
};
</script>
