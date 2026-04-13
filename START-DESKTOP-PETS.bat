@echo off
setlocal

:: Directory Context: Automatically change working directory to script location
cd /d "%~dp0"

echo --- Starting Desktop Pet ---

:: Ollama Check: Detect if the Ollama process is currently running
echo Checking AI Service...
tasklist /fi "ImageName eq ollama.exe" /fo csv 2>NUL | find /i "ollama.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo Ollama is ready.
) else (
    echo Initializing AI... starting Ollama application.
    :: Attempt to start Ollama application (assuming it's in the PATH or standard location)
    start "" "ollama.exe"
    :: Wait 5 seconds for initialization
    echo Waiting 5 seconds for server to initialize...
    timeout /t 5 /nobreak > NUL
)

:: Dependency Check: Check if node_modules folder exists
echo Checking Files...
if not exist node_modules (
    echo Dependencies missing... running npm install.
    call npm install
)

:: App Execution: Execute npm start
echo Starting Pet...
call npm start

pause
