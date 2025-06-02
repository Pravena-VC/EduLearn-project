#!/bin/bash

echo "Starting Django server with Daphne ASGI server..."

# Activate virtual environment if needed
if [ -d "env" ]; then
  source env/bin/activate
fi

# Move to the correct directory
cd $(dirname "$0")

# Set Django settings module
export DJANGO_SETTINGS_MODULE=backend.settings

# Run Daphne through Python to ensure correct module path
python -m daphne -b 0.0.0.0 -p 8000 backend.asgi:application
