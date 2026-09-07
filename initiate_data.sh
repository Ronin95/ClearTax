#!/bin/bash

# Exit immediately if any command fails
set -e

echo "🚀 Initiating Data Setup..."

# Navigate to the server directory
cd /home/ronin/Documents/ClearTax/server

echo "▶️ Running create_garage_setup.sh..."
./create_garage_setup.sh

echo "▶️ Running upload_s3.sh..."
./upload_s3.sh

echo "▶️ Running run_seeds.sh..."
./run_seeds.sh

echo "🎉 All data initialization scripts have completed successfully!"
