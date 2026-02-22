#!/bin/bash

# Start Backend (Mac/Linux)
echo "Starting Django backend..."
cd backend

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start server
echo "Starting server on http://localhost:8000"
python manage.py runserver

