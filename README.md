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

## CI in Harness and GitHub Actions

Both pipelines run the Node unit tests, build the Linux AMD64 image from the same Dockerfile, and smoke-test the running image. Pull requests to `main` verify the image. Pushes to `main`, including merges, also publish the tested image to the private Docker Hub repository `atltvri/sample-app`.

| Concept | Harness | GitHub Actions |
| --- | --- | --- |
| YAML | [Pipeline Studio snapshot](.harness/ghost-relay-ci.yaml) | [Workflow](.github/workflows/ghost-relay-ci.yml) |
| Event | GitHub webhook triggers `PR verification` and `Main publish` | `on.pull_request` and `on.push` with `branches: [main]` |
| Source | Build stage clones via the GitHub App connector | Checkout action |
| Runner | One Harness Cloud CI stage on Linux AMD64 | One job on a GitHub-hosted Ubuntu runner |
| Tests | Run step with a JUnit report in the Tests tab | Run step with a downloadable JUnit artifact |
| Build and verify | Docker CLI and the repo smoke script in Run steps | Docker Buildx action with GitHub cache, then the same smoke script |
| Publish | Project secret `docker-access` and a main-only Run step | Repository secret `DOCKERHUB_TOKEN` and a main-only login and push |
| Image tag | `hrns-sha-<commit>` | `gha-sha-<commit>` |

AT-Test stores the live pipeline inline. The checked-in Harness YAML is its snapshot. Pipeline Studio in this account requires an active license for the built-in **Build and Push to Docker** step, so the live pipeline uses Docker CLI commands from Harness Run steps. GitHub Actions always uploads the tested image archive and publishes on `main` when its Docker Hub secret is configured.
