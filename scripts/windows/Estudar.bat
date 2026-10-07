@echo off
title Roadmap Live Coding
echo.
echo   Roadmap Live Coding
echo   Iniciando dentro do WSL (Ubuntu)...
echo.
echo   Feche esta janela para parar a aplicacao.
echo.
rem WATCH_TOKEN e o nome deste arquivo: ele aparece na linha de comando
rem do cmd.exe, e e assim que o script do WSL descobre que a janela fechou.
wsl.exe -d Ubuntu -- bash -lc "cd /home/diego/programacao/Grafos && WATCH_TOKEN=Estudar.bat ./scripts/start.sh"
echo.
echo   Aplicacao encerrada.
timeout /t 5 >nul
