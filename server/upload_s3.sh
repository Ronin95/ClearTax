#!/bin/bash

# Navigate to the root directory
cd /home/ronin/Documents/ClearTax

echo "🚀 Preparing to upload LoremIpsum.pdf to Garage S3..."

# Automatically load all variables from your .env file
export $(grep -v '^#' .env | xargs)

# We use 3910 because that is the Garage S3 API port exposed to your Linux host
ENDPOINT="http://localhost:3910" 
BUCKET="cleartax-file-uploads"

echo "📤 Uploading LoremIpsum.pdf to s3://$BUCKET/LoremIpsum.pdf using Docker..."

# Run the official AWS CLI inside a temporary, disposable Docker container!
# We mount your current folder so the container can physically see LoremIpsum.pdf
docker run --rm --network host \
  -e AWS_ACCESS_KEY_ID=$GARAGE_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$GARAGE_SECRET_KEY \
  -e AWS_DEFAULT_REGION=$GARAGE_REGION \
  -v $(pwd):/workspace -w /workspace \
  amazon/aws-cli --endpoint-url $ENDPOINT s3 cp ./LoremIpsum.pdf s3://$BUCKET/LoremIpsum.pdf

echo "✅ S3 Upload Complete!"
