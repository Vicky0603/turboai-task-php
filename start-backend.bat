@echo off
echo Starting Django Backend...
cd backend
call venv\Scripts\activate.bat
echo.
echo If this is your first time, install dependencies with:
echo python -m pip install -r requirements.txt
echo.
python manage.py runserver

