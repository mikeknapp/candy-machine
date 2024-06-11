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


:: Define a label to handle cleanup
:cleanup
if defined CLEANUP (
    echo Cleaning up...
    :: Deactivate the virtual environment
    call .\venv\Scripts\deactivate
    exit /B 0
)

:: Step 5: Run the server
set CLEANUP=1
python server\main.py --prod

:: Step 6: Deactivate the virtual environment
set CLEANUP=
call .\venv\Scripts\deactivate

exit /B 0
