import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Store from "electron-store";
import { Constants } from "./utils/constants";
import fs from "fs";
import ip from "ip";
import os from "os";

const storage = new Store();
const defaultHome = `${os.homedir()}/${Constants.BASE_DIR}`;

// Appropriate title
document.title = "TarDrop";

Vue.config.productionTip = false;
Vue.prototype.$bus = new Vue();

// Create default download folder
if (!fs.existsSync(defaultHome)) fs.mkdirSync(defaultHome);

Vue.mixin({
  data: () => ({
    myAddress: ip.address(),
    myHome: defaultHome,
    myName: storage.get(Constants.STORE_APP_NAME) || ip.address(),
    myDownload: storage.get(Constants.STORE_APP_DOWNLOAD) || defaultHome,
    uncompressData: storage.get(Constants.STORE_APP_UNCOMPRESS) ?? true,
    flattenStructure: storage.get(Constants.STORE_APP_FLATTEN) ?? true,
    netcatCommand: storage.get(Constants.STORE_APP_NETCAT) || "nc",
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
