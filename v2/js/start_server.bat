@echo off
title Matrix Maze Local Server

echo Starting local server for Matrix Maze...
cd /d "%~dp0"
echo Current directory: %cd%

if not exist "maze.html" (
    echo ERROR: maze.html not found! Put script in the project root.
    pause
    exit /b 1
)

set PORT=8000
set URL=http://localhost:%PORT%/maze.html

echo Attempting to open %URL% using default Chrome (via PATH)...
:: This relies on chrome.exe being in your system PATH
start chrome "%URL%"

echo Starting Python HTTP server on port %PORT%...
echo (Press CTRL+C in this window to stop the server)
python -m http.server %PORT%

echo Server stopped.
pause