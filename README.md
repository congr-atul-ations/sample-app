# sample-app

**Ghost Relay** is a ’90s arcade-style React memory game. Flip tiles to find all eight pairs and try to finish in fewer moves. The game runs in the browser and saves your best score locally.

## Play in development

Use Node.js 24 and npm.

```sh
npm ci
npm test
npm run dev
```

## Build and verify the container

```sh
docker build --pull --progress=plain -t sample-app:local .
./scripts/smoke-image.sh sample-app:local
docker run --rm -p 127.0.0.1:8080:8080 sample-app:local
```

Open http://127.0.0.1:8080. In the Docker build, Node installs dependencies from the lockfile and runs Vite to produce `dist/`. The final Nginx image copies in the compiled files and serves them on port 8080. The smoke test starts the image and checks that it serves the game page, compiled JavaScript, and CSS.

## Save or transfer the image

```sh
docker save sample-app:local | gzip > sample-app-local.tar.gz
docker load --input sample-app-local.tar.gz
```

For a Linux x86-64 target, add `--platform linux/amd64` to the build command. For a CI build, use the source commit SHA as the image tag so each image can be traced to its source.
