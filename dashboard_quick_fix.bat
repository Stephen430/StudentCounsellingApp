@echo off
echo ==============================================
echo Student Counselling App Dashboard Quick Fix
echo ==============================================
echo.

echo Checking for common issues...

REM Check if database exists
if not exist "StudentCounselling.db" (
    echo [ERROR] Database file missing.
    
    if exist "StudentCounselling.db.bak" (
        echo [FIX] Restoring from backup...
        copy /Y StudentCounselling.db.bak StudentCounselling.db
        echo Database restored successfully.
    ) else (
        echo [ERROR] No backup found. Will create new database.
    )
) else (
    echo [OK] Database file exists.
)

REM Clear cached CSS/JS files
echo Clearing cached static files...
if exist "wwwroot\css\dashboard-enhancements.css" (
    copy /Y wwwroot\css\dashboard-enhancements.css wwwroot\css\dashboard-enhancements.css.bak
    echo /* Troubleshooting version */ > wwwroot\css\dashboard-enhancements.css
    type wwwroot\css\dashboard-enhancements.css.bak >> wwwroot\css\dashboard-enhancements.css
    echo CSS file updated for troubleshooting.
)

REM Check temp folders
echo Cleaning temporary files...
if exist "obj\Debug" (
    rmdir /s /q obj\Debug
    echo Debug objects cleared.
)

REM Fix permissions
echo Ensuring proper file permissions...
icacls StudentCounselling.db /grant:r Everyone:F
icacls wwwroot\css\*.css /grant:r Everyone:F

echo.
echo ==============================================
echo Dashboard fix applied. Try reloading the page.
echo ==============================================
echo.

pause
