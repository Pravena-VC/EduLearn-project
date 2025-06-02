@echo off
echo Starting Django server with Daphne ASGI server...

REM Activate virtual env
IF EXIST env\Scripts\activate.bat (
    call env\Scripts\activate.bat
)

REM Set Django settings module
set DJANGO_SETTINGS_MODULE=backend.settings

REM Run Daphne
python -m daphne -b 0.0.0.0 -p 8000 backend.asgi:application
