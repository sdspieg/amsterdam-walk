#!/usr/bin/env bash
# Deploy the Amsterdam Anne Frank Walk static site to the RuBase server.
#
# Run from the project root (the directory that contains index.html):
#   ./deploy/deploy.sh
#
# What it does:
#   1. rsyncs index.html, assets/, and data/ to /stratbase/apps/webapps/amsterdam-walk on
#      the Hetzner box (138.201.62.161).
#   2. The first time, also installs the nginx vhost from deploy/nginx.amsterdam-walk.rubase.org.conf
#      and runs certbot for the cert.

set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-root@138.201.62.161}"
REMOTE_PATH="/stratbase/apps/webapps/amsterdam-walk"
LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Deploying $LOCAL_ROOT  →  $REMOTE_HOST:$REMOTE_PATH"

# 1. Make sure remote dir exists
ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"

# 2. Sync site files (exclude scratch / deploy infra)
rsync -avz --delete \
  --exclude '.DS_Store' \
  --exclude 'deploy/' \
  --exclude 'data/stops.sample.json' \
  --exclude 'Katherine'\''s Amsterdam Walk.md' \
  --exclude '_tana_pending.md' \
  "$LOCAL_ROOT/" "$REMOTE_HOST:$REMOTE_PATH/"

# 3. (Idempotent) install nginx vhost if not present
ssh "$REMOTE_HOST" bash <<'REMOTE'
set -euo pipefail
VHOST=/etc/nginx/sites-available/amsterdam-walk.rubase.org
if [ ! -f "$VHOST" ]; then
  cp /stratbase/apps/webapps/amsterdam-walk/deploy/nginx.amsterdam-walk.rubase.org.conf "$VHOST" 2>/dev/null \
    || cp /tmp/amsterdam-walk-nginx.conf "$VHOST"
  ln -sf "$VHOST" /etc/nginx/sites-enabled/amsterdam-walk.rubase.org
  nginx -t && systemctl reload nginx
  echo "nginx vhost installed."
else
  echo "nginx vhost already present."
  nginx -t && systemctl reload nginx
fi
REMOTE

echo
echo "Deploy complete."
echo "Next steps if first-time deploy:"
echo "  1. Point DNS: amsterdam-walk.rubase.org  CNAME (or A) → 138.201.62.161"
echo "  2. ssh $REMOTE_HOST 'certbot --nginx -d amsterdam-walk.rubase.org --non-interactive --agree-tos --redirect -m sdspieg@gmail.com'"
echo "  3. Browse: https://amsterdam-walk.rubase.org/"
