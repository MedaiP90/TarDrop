const { defineConfig } = require("@vue/cli-service");
const pkg = require("./package.json");

process.env.VUE_APP_VERSION = pkg.version || "0.0.0";
process.env.VUE_APP_GITHUB_PAGE = pkg.homepage || "";
process.env.VUE_APP_GITHUB_BUGS = pkg.bugs.url || "";

const builderOpts = {
  appRepos: [
    {
      provider: "github",
      owner: "MedaiP90",
      private: false,
      publishAutoUpdate: true,
      releaseType: "release",
    },
  ],
  appStrings: {
    synopsis: pkg.description,
    executableName: pkg.name,
    description: "Linux LAN file transfer using tar and NetCat.",
  },
  appCategories: {
    linux: "Development",
  },
};

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  pwa: {
    name: "TarDrop",
    themeColor: "#24292b",
    msTileColor: "#24292b",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "white",

    // configure the workbox plugin
    workboxPluginMode: "GenerateSW",
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: true,
      builderOptions: {
        appId: "com.medai.${name}",
        artifactName: "${name}-${version}-${platform}-${arch}.${ext}",
        productName: "TarDrop",
        publish: [...builderOpts.appRepos],
        linux: {
          executableName: builderOpts.appStrings.executableName,
          icon: "build/icon/",
          target: ["AppImage"],
        },
        appImage: {
          category: builderOpts.appCategories.linux,
          description: builderOpts.appStrings.description,
          desktop: {
            StartupWMClass: builderOpts.appStrings.executableName,
          },
          synopsis: builderOpts.appStrings.synopsis,
        },
      },
    },
  },
});
