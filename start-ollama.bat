@echo off
echo Checking for existing Ollama processes...
tasklist | findstr "ollama app.exe"
if %ERRORLEVEL% == 0 (
    echo Killing existing Ollama processes...
    taskkill /IM "ollama app.exe" /F
    timeout /t 2
)
echo Checking if port 11434 is in use...
netstat -aon | findstr :11434
if %ERRORLEVEL% == 0 (
    echo Port 11434 is in use, attempting to free it...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :11434') do taskkill /PID %%a /F
    timeout /t 2
)
echo Starting Ollama on port 11434...
ollama serve
