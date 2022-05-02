# TarDrop

## Dependencies

For the application to run correctly your Linux system must have the following commands available:

- `tar`: for packages compression
- `nc`: for data transfer

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run electron:serve
```

### Generate app icons

```bash
npm run electron:icons
```

## Compiles and minifies for production

**N.B.**: the build process includes **electron publish**, a *.env* file with the `GH_TOKEN` environment variable set is required.

```bash
npm run electron:build -- --linux # Without publish
npm run electron:build -- --linux -p always # With GitHub publish
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
