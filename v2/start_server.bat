@echo off
title Matrix Maze Local Server

echo Starting local server for Matrix Maze...

:: Change directory to the location of this batch file
cd /d "%~dp0"
echo Current directory: %cd%

:: Check if maze.html exists here
if not exist "maze.html" (
    echo ERROR: maze.html not found in this directory!
    echo Make sure this script is in the SAME folder as maze.html.
    pause
    exit /b 1
)

:: Specify the port (e.g., 8000)
set PORT=8000
set URL=http://localhost:%PORT%/maze.html

:: Define potential Chrome paths
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_NORMAL="C:\Program Files\Google\Chrome\Application\chrome.exe"

:: Check which path exists and use it
if exist %CHROME_PATH_X86% (
    echo Found Chrome at: %CHROME_PATH_X86%
    echo Opening %URL%...
    start "" %CHROME_PATH_X86% "%URL%"
) else if exist %CHROME_PATH_NORMAL% (
    echo Found Chrome at: %CHROME_PATH_NORMAL%
    echo Opening %URL%...
    start "" %CHROME_PATH_NORMAL% "%URL%"
) else (
    echo WARNING: Could not find Chrome automatically at standard locations.
    echo Please open %URL% manually in your browser.
)

echo Starting Python HTTP server on port %PORT%...
echo (Press CTRL+C in this window to stop the server)
python -m http.server %PORT%

echo Server stopped.
pause