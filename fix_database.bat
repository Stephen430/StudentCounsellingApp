@echo off
echo Fixing database issues...

echo Stopping any running instances...
taskkill /F /IM StudentCounsellingApp.exe 2>nul

echo Cleaning old database files...
del /F StudentCounselling.db 2>nul
del /F StudentCounselling.db-shm 2>nul
del /F StudentCounselling.db-wal 2>nul

echo Restoring from backup if available...
if exist StudentCounselling.db.bak (
    copy /Y StudentCounselling.db.bak StudentCounselling.db
    echo Restored from backup.
) else (
    echo No backup found, will create fresh database.
)

echo Building application...
dotnet build

echo Starting application with logging...
dotnet run --launch-profile Development > app_debug.log 2>&1
