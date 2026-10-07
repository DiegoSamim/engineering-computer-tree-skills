#!/usr/bin/env bash
#
# Rede de seguranca: derruba o que tiver sobrado ouvindo nas portas do app.
#
set -uo pipefail

for port in "${WEB_PORT:-5183}" "${API_PORT:-8787}"; do
  pids="$(ss -lntp 2>/dev/null | grep -oP "(?<=:)$port\b.*pid=\K[0-9]+" | sort -u || true)"
  if [ -z "$pids" ]; then
    echo "porta $port: livre"
    continue
  fi
  for pid in $pids; do
    kill "$pid" 2>/dev/null && echo "porta $port: encerrado pid $pid" || true
  done
done
