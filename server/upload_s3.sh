#!/bin/bash

# Load environment variables
if [ -f "$(dirname "$0")/../.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
fi

# Navigate to the root directory
cd $PATH_TO_CLEARTAX_FOLDER/ClearTax

echo "🚀 Preparing to upload LoremIpsum.pdf to Garage S3..."

# Use 3910 because that is the Garage S3 API port exposed to Linux host
ENDPOINT="http://localhost:3910" 
BUCKET="cleartax-file-uploads"

echo "📤 Uploading LoremIpsum.pdf to s3://$BUCKET/LoremIpsum.pdf using Docker..."

# Run the official AWS CLI inside a temporary, disposable Docker container!
# Mount the current folder so the container can physically see LoremIpsum.pdf
docker run --rm --network host \
  -e AWS_ACCESS_KEY_ID=$GARAGE_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$GARAGE_SECRET_KEY \
  -e AWS_DEFAULT_REGION=$GARAGE_REGION \
  -v $(pwd):/workspace -w /workspace \
  amazon/aws-cli --endpoint-url $ENDPOINT s3 cp ./LoremIpsum.pdf s3://$BUCKET/LoremIpsum.pdf

echo "✅ S3 Upload Complete!"
