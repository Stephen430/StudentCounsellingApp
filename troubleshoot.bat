@echo off
echo =======================================================
echo STUDENT COUNSELLING APP TROUBLESHOOTER
echo =======================================================
echo.

cd c:\Users\USER\Downloads\student-counselling-app\StudentCounsellingApp

echo STEP 1: CLEANING PREVIOUS BUILD ARTIFACTS
echo -----------------------------------------
dotnet clean
echo.
echo Clean completed!
echo.
pause

echo STEP 2: RESTORING PACKAGES
echo -------------------------
dotnet restore --no-cache
echo.
echo Restore completed!
echo.
pause

echo STEP 3: BUILDING PROJECT
echo ----------------------
dotnet build --verbosity detailed > build_log.txt
echo Build output saved to build_log.txt
echo.
echo Build completed!
echo.
pause

echo STEP 4: SETUP ENVIRONMENT VARIABLES
echo --------------------------------
echo Setting Development environment for detailed errors...
SET ASPNETCORE_ENVIRONMENT=Development
echo Environment set to: %ASPNETCORE_ENVIRONMENT%
echo.

echo STEP 5: CHECK DATABASE
echo --------------------
if exist "StudentCounselling.db" (
    echo Database exists: StudentCounselling.db
) else (
    echo Database does not exist - will be created on startup.
)
echo.
pause

echo STEP 6: DASHBOARD DIAGNOSTICS
echo --------------------------
echo After the application starts, please visit these URLs for diagnostics:
echo - Dashboard Diagnostics: http://localhost:5000/dashboard/diagnostics
echo - Main Application: http://localhost:5000
echo.

echo STEP 7: ATTEMPT TO RUN THE APPLICATION
echo -----------------------------------
echo Starting application with detailed logging...
echo Application will be available at:
echo https://localhost:5001 and http://localhost:5000
echo.
echo Press Ctrl+C to stop the application when done testing.
echo.
pause

dotnet run --urls="http://localhost:5000" --verbose
