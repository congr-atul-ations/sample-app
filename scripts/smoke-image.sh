#!/bin/sh
set -eu

image=${1:?Usage: smoke-image.sh IMAGE}
scratch=$(mktemp -d)
container=''

cleanup() {
  status=$?
  if [ -n "$container" ]; then
    if [ "$status" -ne 0 ]; then
      docker logs "$container" >&2 || true
    fi
    docker rm -f "$container" >/dev/null 2>&1 || true
  fi
  rm -rf "$scratch"
}
trap cleanup EXIT

container=$(docker run -d -p 127.0.0.1::8080 "$image")
address=$(docker port "$container" 8080/tcp)

curl --fail --silent --show-error --retry 10 --retry-all-errors --retry-delay 1 \
  --max-time 5 "http://$address/" -o "$scratch/index.html"
grep -Fq '<title>Ghost Relay | Arcade</title>' "$scratch/index.html"

for extension in js css; do
  asset=$(grep -Eo "/assets/[a-zA-Z0-9._-]+\.$extension" "$scratch/index.html" | head -n 1)
  test -n "$asset"
  curl --fail --silent --show-error --max-time 5 "http://$address$asset" -o "$scratch/app.$extension"
  test -s "$scratch/app.$extension"
done

printf 'Smoke test passed for %s (HTML, compiled JavaScript and CSS).\n' "$image"
