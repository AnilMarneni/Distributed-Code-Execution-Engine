@echo off
g++ -Iinclude src/main.cpp -o worker.exe -lws2_32
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)
echo Build successful!
