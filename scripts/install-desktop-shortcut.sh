#!/usr/bin/env bash
#
# Copia o launcher para a area de trabalho do Windows.
# E a unica coisa que este projeto escreve fora do proprio repositorio.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT/scripts/windows"

[ -f "$SRC_DIR/Estudar.bat" ] || { echo "ERRO: $SRC_DIR/Estudar.bat nao existe." >&2; exit 1; }

# Descobre o perfil do Windows via interop; cai no caminho conhecido se falhar.
desktop=""
if command -v cmd.exe >/dev/null 2>&1; then
  winprofile="$(cd /mnt/c && cmd.exe /c 'echo %USERPROFILE%' 2>/dev/null | tr -d '\r\n' || true)"
  if [ -n "$winprofile" ]; then
    candidate="$(wslpath -u "$winprofile" 2>/dev/null || true)/Desktop"
    [ -d "$candidate" ] && desktop="$candidate"
  fi
fi
[ -z "$desktop" ] && [ -d "$HOME/../../mnt/c/Users/Diego/Desktop" ] && desktop="/mnt/c/Users/Diego/Desktop"
[ -z "$desktop" ] && [ -d "/mnt/c/Users/Diego/Desktop" ] && desktop="/mnt/c/Users/Diego/Desktop"

[ -n "$desktop" ] || { echo "ERRO: nao encontrei a area de trabalho do Windows." >&2; exit 1; }

cp "$SRC_DIR/Estudar.bat" "$desktop/Estudar.bat"
cp "$SRC_DIR/Parar.bat" "$desktop/Parar.bat"
echo "Instalado em $desktop:"
echo "  Estudar.bat  - abre a aplicacao (duplo clique)"
echo "  Parar.bat    - encerra, caso algo tenha ficado rodando"
