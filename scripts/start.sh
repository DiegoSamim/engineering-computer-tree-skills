#!/usr/bin/env bash
#
# Sobe a aplicação inteira em modo desenvolvimento: API (SQLite) + Vite (HMR).
# É o que o atalho da área de trabalho chama. Fechar a janela derruba os dois.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WEB_PORT="${WEB_PORT:-5183}"
API_PORT="${API_PORT:-8787}"
URL="http://localhost:${WEB_PORT}"

# O Node costuma vir do nvm, que não está no PATH de shells não-interativos.
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 || true
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: node nao encontrado no PATH do WSL." >&2
  exit 1
fi

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") >/dev/null 2>&1; }

open_browser() {
  # NO_OPEN=1 sobe tudo sem abrir navegador (testes automatizados).
  [ "${NO_OPEN:-0}" = "1" ] && return 0
  # A partir do WSL, explorer.exe abre no navegador padrao do Windows.
  if command -v explorer.exe >/dev/null 2>&1; then
    explorer.exe "$1" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$1" >/dev/null 2>&1 || true
  else
    echo "Abra manualmente: $1"
  fi
}

wait_for_port() {
  local port="$1" label="$2" tries=0
  until port_open "$port"; do
    tries=$((tries + 1))
    if [ "$tries" -gt 120 ]; then
      echo "ERRO: $label nao subiu na porta $port." >&2
      return 1
    fi
    sleep 0.25
  done
}

# Se ja estiver rodando, nao sobe de novo: so abre o navegador.
if port_open "$WEB_PORT" && port_open "$API_PORT"; then
  echo "Aplicacao ja esta rodando. Abrindo $URL"
  open_browser "$URL"
  exit 0
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias (primeira execucao)..."
  npm install
fi

API_PID=""
WEB_PID=""
WATCHDOG_PID=""
MAIN_PID=$$

cleanup() {
  trap - EXIT INT TERM
  echo ""
  echo "Encerrando..."
  [ -n "$WATCHDOG_PID" ] && kill "$WATCHDOG_PID" 2>/dev/null || true
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ] && kill "$WEB_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- Watchdog da janela do Windows -------------------------------------------
# Fechar a janela do cmd NAO propaga sinal nenhum para o lado Linux do WSL: o
# trap acima nunca dispara e a API e o Vite ficariam rodando orfaos. Entao o
# .bat passa um token na propria linha de comando e aqui perguntamos ao Windows
# se aquele processo ainda existe. Foi a unica forma confiavel nos testes:
# o filtro por WINDOWTITLE nao encontra nada, e $PPID ja nasce morto.
start_watchdog() {
  [ -n "${WATCH_TOKEN:-}" ] || return 0
  command -v powershell.exe >/dev/null 2>&1 || return 0

  (
    while sleep 5; do
      count="$(powershell.exe -NoProfile -Command \
        "(Get-CimInstance Win32_Process -Filter \"Name='cmd.exe'\" | Where-Object { \$_.CommandLine -like '*${WATCH_TOKEN}*' } | Measure-Object).Count" \
        2>/dev/null | tr -d '\r\n ')"
      case "$count" in
        '' | *[!0-9]*) continue ;;   # consulta falhou: nao derrubar por engano
        0) kill -TERM "$MAIN_PID" 2>/dev/null; exit 0 ;;
      esac
    done
  ) &
  WATCHDOG_PID=$!
}

# Node e Vite sao chamados direto (nao via npm) para que os PIDs capturados
# sejam os processos reais — via npm, matar o wrapper deixaria orfaos.
echo "Iniciando API na porta ${API_PORT}..."
PORT="$API_PORT" node --experimental-strip-types --disable-warning=ExperimentalWarning server/index.ts &
API_PID=$!
wait_for_port "$API_PORT" "API"

echo "Iniciando interface na porta ${WEB_PORT}..."
# --host 0.0.0.0: o encaminhamento de localhost do WSL2 e confiavel para
# servicos em 0.0.0.0 e intermitente para os presos em 127.0.0.1.
VITE_API_URL="/api" API_PORT="$API_PORT" \
  ./node_modules/.bin/vite --port "$WEB_PORT" --strictPort --host 0.0.0.0 &
WEB_PID=$!
wait_for_port "$WEB_PORT" "Vite"

start_watchdog

echo ""
echo "  Pronto: $URL"
echo "  Feche esta janela para parar a aplicacao."
echo ""
open_browser "$URL"

# Se qualquer um dos dois morrer, o trap derruba o outro.
wait -n "$API_PID" "$WEB_PID"
