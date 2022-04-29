import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Store from "electron-store";
import Constants from "./utils/constants";
import ip from "ip";
import os from "os";

const storage = new Store();

// Appropriate title
document.title = "TarDrop";

Vue.config.productionTip = false;

Vue.mixin({
  data: () => ({
    myAddress: ip.address(),
    myHome: os.homedir(),
    myName: storage.get(Constants.STORE_APP_NAME) || ip.address(),
    myDownload: storage.get(Constants.STORE_APP_DOWNLOAD) || os.homedir(),
  }),

  methods: {
    saveInStore(key, value) {
      storage.set(key, value);
    },
    getFromStore(key, defaultValue) {
      return storage.get(key, defaultValue);
    },
  },
});

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
