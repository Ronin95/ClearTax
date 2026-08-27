#!/bin/bash

# Configuration
CONTAINER_NAME="cleartax_garage"
NODEJS_CONTAINER="cleartax_nodejs"
IMAGE_BUCKET="cleartax-image-uploads"
FILE_BUCKET="cleartax-file-uploads"

echo "🚀 Starting Garage S3 Automated Setup..."

# 1. Setup Layout
echo "🔍 Extracting Garage Node ID..."
NODE_ID=$(docker exec $CONTAINER_NAME /garage status | grep -o 'dc[a-z0-9]*' | head -n 1)

if [ -z "$NODE_ID" ]; then
    echo "❌ Failed to find Node ID. Is Garage running?"
    exit 1
fi
echo "✅ Found Node ID: $NODE_ID"

echo "⚙️  Assigning layout and capacity..."
docker exec $CONTAINER_NAME /garage layout assign $NODE_ID -c 1G -z dc1 >/dev/null 2>&1
docker exec $CONTAINER_NAME /garage layout apply --version 1 >/dev/null 2>&1
echo "✅ Layout applied!"

# 2. Create Buckets
echo "🪣  Creating S3 buckets..."
docker exec $CONTAINER_NAME /garage bucket create $IMAGE_BUCKET >/dev/null 2>&1 || echo "⚠️ Bucket $IMAGE_BUCKET already exists, skipping."
docker exec $CONTAINER_NAME /garage bucket create $FILE_BUCKET >/dev/null 2>&1 || echo "⚠️ Bucket $FILE_BUCKET already exists, skipping."

# 3. Create Key and Extract Credentials
# Use a unique key name with a timestamp to avoid duplicates if run multiple times
UNIQUE_KEY_NAME="cleartax-s3-$(date +%s)"
echo "🔑 Creating key: $UNIQUE_KEY_NAME..."
KEY_OUTPUT=$(docker exec $CONTAINER_NAME /garage key create $UNIQUE_KEY_NAME)

# Extract using grep/awk
KEY_ID=$(echo "$KEY_OUTPUT" | grep "Key ID" | awk '{print $4}')
SECRET_KEY=$(echo "$KEY_OUTPUT" | grep "Secret key" | awk '{print $4}')

if [ -z "$KEY_ID" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ Failed to extract keys from Garage! Output was:"
    echo "$KEY_OUTPUT"
    exit 1
fi

echo "✅ Extracted Key ID: $KEY_ID"
echo "✅ Extracted Secret Key: $SECRET_KEY"

# 4. Update .env
echo "📝 Updating .env file with new credentials..."
sed -i "s/^GARAGE_ACCESS_KEY=.*/GARAGE_ACCESS_KEY=$KEY_ID/" .env
sed -i "s/^GARAGE_SECRET_KEY=.*/GARAGE_SECRET_KEY=$SECRET_KEY/" .env
echo "✅ .env file successfully updated!"

# 5. Grant Permissions using the specific KEY_ID (Prevents the "2 matching keys" error!)
echo "🔐 Granting bucket permissions to the new key..."
docker exec $CONTAINER_NAME /garage bucket allow $IMAGE_BUCKET --read --write --owner --key $KEY_ID
docker exec $CONTAINER_NAME /garage bucket allow $FILE_BUCKET --read --write --owner --key $KEY_ID
echo "✅ Permissions granted!"

# 6. Restart Node.js Backend
echo "🔄 Restarting the Node.js backend to apply the new .env file..."
docker restart $NODEJS_CONTAINER
echo "✅ Backend restarted!"

echo "🎉 Garage S3 Setup Complete! Everything is wired up automatically!"
