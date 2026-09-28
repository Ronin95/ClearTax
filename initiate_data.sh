#!/bin/bash

# Exit immediately if any command fails
set -e

# Load environment variables
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

echo "🚀 Initiating Data Setup..."

# Navigate to the server directory
cd $PATH_TO_CLEARTAX_FOLDER/ClearTax/server

echo "▶️ Running create_garage_setup.sh..."
./create_garage_setup.sh

echo "▶️ Running upload_s3.sh..."
./upload_s3.sh

echo "▶️ Running run_seeds.sh..."
./run_seeds.sh

echo "🎉 All data initialization scripts have completed successfully!"
