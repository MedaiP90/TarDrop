# TarDrop

Under the hood _TarDrop_ implements the mechanism of file transfer via `tar` + `netcat` and combines it with _auto-discovery_ of other hosts on the local network.

You can manually achieve the same results using the following commands:

```bash
# Receiver
nc -l -p [port_number] | tar -xz

# Sender
tar -czf - [files_list] | nc [remote_host] [remote_port]
```

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

**N.B.**: the build process includes **electron publish**, a _.env_ file with the `GH_TOKEN` environment variable set is required.

```bash
npm run electron:build -- --linux # Without publish
npm run electron:build -- --linux -p always # With GitHub publish
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Contributors

[![Contributors](https://contrib.rocks/image?repo=MedaiP90/TarDrop)](https://github.com/MedaiP90/TarDrop/graphs/contributors)

Made with [contrib.rocks](https://contrib.rocks).
