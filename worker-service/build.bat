@echo off
set "CC=C:\msys64\ucrt64\bin\g++.exe"
cd /d "E:\Projects\Distributed_Code_Execution_And_Evaluation_Engine\worker-service"
"%CC%" src\main.cpp -Iinclude -o worker.exe -lws2_32 -std=c++17
if %ERRORLEVEL% NEQ 0 (
    echo Build failed with code %ERRORLEVEL%
) else (
    echo Build successful
)
