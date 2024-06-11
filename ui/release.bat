:: This script is used to build the UI and copy the files to the server
:: Be sure to stop your UI server before you run!

:: Remove the old dist folders
rmdir /s /q dist
rmdir /s /q ..\server\dist

:: Build a fresh copy
call yarn build

:: Remove the map files
for /r dist %%i in (*.map) do del %%i

:: Make the server dist folder
mkdir ..\server\dist

:: Copy the files to the server
xcopy /s /y dist\* ..\server\dist
