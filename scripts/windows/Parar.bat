@echo off
title Parar Roadmap Live Coding
echo.
echo   Encerrando a aplicacao...
echo.
wsl.exe -d Ubuntu -- bash -lc "cd /home/diego/programacao/Grafos && ./scripts/stop.sh"
echo.
pause
