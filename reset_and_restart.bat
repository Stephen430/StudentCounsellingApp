@echo off
echo Stopping any running instances...
taskkill /F /IM StudentCounsellingApp.exe 2>nul

echo Cleaning build...
dotnet clean

echo Removing database files...
del /F StudentCounselling.db 2>nul
del /F StudentCounselling.db-shm 2>nul
del /F StudentCounselling.db-wal 2>nul

echo Building application...
dotnet build

echo Starting application...
dotnet run
