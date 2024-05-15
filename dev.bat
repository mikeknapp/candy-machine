@echo off
setlocal EnableDelayedExpansion

:: Step 1: Check if the virtual environment directory exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists
)

:: Step 2: Activate the virtual environment
call .\venv\Scripts\activate

:: Step 3: Install dependencies
pip install -r requirements.txt

:: Step 4: Set environment variable
set CANDY_MACHINE_ENV=dev

:: Define a label to handle cleanup
:cleanup
if defined CLEANUP (
    echo Cleaning up...
    :: Deactivate the virtual environment
    call .\venv\Scripts\deactivate
    exit /B 0
)

:: Step 5: Start the frontend using Yarn
echo Starting frontend...
cd ui
start yarn start
cd ..

:: Step 6: Wait for frontend to start and open browser
timeout /t 2
start http://localhost:1234

:: Step 7: Run the Flask server
set CLEANUP=1
python server\main.py

:: Step 8: Deactivate the virtual environment
set CLEANUP=
call .\venv\Scripts\deactivate

exit /B 0
