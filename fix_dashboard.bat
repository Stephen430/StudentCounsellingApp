@echo off
echo ======================================================
echo Dashboard Troubleshooter for Student Counselling App
echo ======================================================
echo.
echo This script will try to diagnose and fix dashboard issues
echo.

REM Check if the app is running
echo 1. Checking if application is already running...
tasklist /fi "imagename eq dotnet.exe" | find "dotnet.exe" > nul
if %errorlevel% equ 0 (
    echo Application is running. Stopping any existing instances...
    taskkill /f /im dotnet.exe > nul 2>&1
    timeout /t 2 /nobreak > nul
) else (
    echo No existing application instances found.
)

REM Delete bin and obj folders to force a clean build
echo 2. Cleaning build artifacts...
if exist "bin" rmdir /s /q bin
if exist "obj" rmdir /s /q obj
echo Build artifacts cleaned.

REM Restore packages
echo 3. Restoring NuGet packages...
dotnet restore

REM Build with more detailed output
echo 4. Rebuilding application...
dotnet build --verbosity detailed

REM Reset database connection
echo 5. Checking database connection...
if exist "StudentCounselling.db" (
    echo Database file exists, creating backup...
    copy StudentCounselling.db StudentCounselling.db.bak > nul
)

REM Run app with dashboard diagnostics
echo 6. Starting application with diagnostics enabled...
echo.
echo ======================================================
echo IMPORTANT: BROWSER INSTRUCTIONS
echo ======================================================
echo 1. When the app starts, navigate to http://localhost:5000
echo 2. Login with your credentials
echo 3. Try each of these diagnostic URLs:
echo    - http://localhost:5000/dashboard/simple
echo    - http://localhost:5000/dashboard/diagnostic-view
echo    - http://localhost:5000/dashboard/emergency-view
echo 4. Press Ctrl+C in this window when you're done
echo ======================================================
echo.
echo Press any key to start the application...
pause > nul

set ASPNETCORE_URLS=http://localhost:5000
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_DETAILEDERRORS=true
dotnet run --no-build --verbosity detailed

echo.
echo Troubleshooting complete.
pause
