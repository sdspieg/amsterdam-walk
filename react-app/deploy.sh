#!/usr/bin/env bash
# Deploy the React build to the RuBase server.
# Run from the react-app directory:
#   cd react-app && ./deploy.sh
#
# Builds the production bundle, then rsyncs dist/ to the server,
# replacing the static-v1 site at /stratbase/apps/webapps/amsterdam-walk.

set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-root@138.201.62.161}"
REMOTE_PATH="/stratbase/apps/webapps/amsterdam-walk"
LOCAL_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 1. Build (must be run from a chmod-friendly location — node_modules can't
#    live on the GDrive mount because chmod fails. By default we work in
#    /tmp/awalk-build/ and sync source there before each build.)
BUILD_DIR="${BUILD_DIR:-/tmp/awalk-build}"
echo "Building in: $BUILD_DIR"
mkdir -p "$BUILD_DIR"
rsync -a --delete --no-perms --no-times --exclude node_modules --exclude dist \
  "$LOCAL_ROOT/" "$BUILD_DIR/"
cd "$BUILD_DIR"
[ -d node_modules ] || npm install --silent
npm run build

# 2. Sanity-check dist
test -f dist/index.html || { echo "ERROR: dist/index.html missing"; exit 1; }
test -d dist/assets || { echo "ERROR: dist/assets missing"; exit 1; }

# 3. Rsync dist/ contents to server
echo "Deploying $BUILD_DIR/dist/  →  $REMOTE_HOST:$REMOTE_PATH"
ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"
rsync -avz --delete \
  --exclude '.DS_Store' \
  "$BUILD_DIR/dist/" "$REMOTE_HOST:$REMOTE_PATH/"

# 4. Reload nginx (vhost was installed by the v1 deploy; React-friendly with
#    its existing try_files $uri $uri/ /index.html fallback)
ssh "$REMOTE_HOST" 'nginx -t && systemctl reload nginx' 2>&1 | tail -3

echo
echo "Deploy complete: https://amsterdam-walk.rubase.org/"
