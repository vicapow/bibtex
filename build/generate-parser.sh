#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build

# Path to the script that generates the parser
SCRIPT_PATH="$(dirname "$0")/generate-parser.js"

# Run the script with Node.js
echo "Running parser generator..."
node "$SCRIPT_PATH"

# Check if the script succeeded
if [ $? -eq 0 ]; then
  echo "✓ Parser generated successfully"
  exit 0
else
  echo "✗ Failed to generate parser"
  exit 1
fi 