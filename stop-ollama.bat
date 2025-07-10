@echo off
echo Killing Ollama processes...
taskkill /IM "ollama app.exe" /F
echo Checking if port 11434 is free...
netstat -aon | findstr :11434
if %ERRORLEVEL% == 0 (
    echo Port 11434 is still in use, attempting to free it...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :11434') do taskkill /PID %%a /F
)
echo Ollama stopped.
