#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if the virtual environment directory exists
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
else
  echo "Virtual environment already exists"
fi

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export FLASK_ENV=production

# Define a function to deactivate the virtual environment on script exit
function cleanup {
  echo "Cleaning up..."
  deactivate
}
trap cleanup EXIT

# Run the server
python server/main.py
