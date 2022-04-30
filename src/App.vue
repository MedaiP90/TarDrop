<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-avatar class="me-5">
        <v-img src="./assets/logo.png" />
      </v-avatar>

      <h2 title="User name">{{ myName }}</h2>

      <v-spacer />

      <v-btn v-on:click="openSettings" title="Settings" icon>
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer>
      <span class="caption" title="Address">{{ myAddress }}</span>

      <v-spacer />

      <span class="caption me-4">v{{ version }}</span>

      <v-btn
        v-on:click="openBugsUrl"
        color="primary"
        title="Report a bug"
        icon
        x-small
      >
        <v-icon small>mdi-bug-outline</v-icon>
      </v-btn>
    </v-footer>

    <v-dialog v-model="settings" width="min(60ch, 90%)" scrollable>
      <v-card v-if="settings">
        <v-card-title>Settings</v-card-title>

        <v-card-text>
          <v-text-field v-model="tmpName" label="User name" clearable />

          <v-text-field
            v-model="tmpDownload"
            label="Download folder"
            clearable
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn v-on:click="settings = false" color="error" text>Cancel</v-btn>

          <v-btn
            v-bind:disabled="!valid"
            v-on:click="saveSettings"
            color="primary"
            text
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: white !important;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #24292b;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:window-inactive {
  background: #24292b;
  border-radius: 4px;
}

::selection {
  background: #24292b;
  color: white;
}
</style>

<script>
import { shell } from "electron";
import { Constants } from "./utils/constants";

export default {
  name: "App",

  data: () => ({
    version: process.env.VUE_APP_VERSION,
    issues: process.env.VUE_APP_GITHUB_BUGS,
    settings: false,

    // Temp values for settings
    tmpName: undefined,
    tmpDownload: undefined,
  }),

  computed: {
    valid() {
      return !!this.tmpName && !!this.tmpDownload;
    },
  },

  methods: {
    openSettings() {
      // Load preferences
      this.tmpName = this.getFromStore(
        Constants.STORE_APP_NAME,
        this.myAddress
      );
      this.tmpDownload = this.getFromStore(
        Constants.STORE_APP_DOWNLOAD,
        this.myHome
      );

      this.settings = true;
    },
    saveSettings() {
      // Save preferences
      this.saveInStore(Constants.STORE_APP_NAME, this.tmpName);
      this.saveInStore(Constants.STORE_APP_DOWNLOAD, this.tmpDownload);

      this.settings = false;
      location.reload();
    },
    openBugsUrl() {
      shell.openExternal(this.issues);
    },
  },
};
</script>
