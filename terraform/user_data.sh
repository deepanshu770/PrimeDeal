#!/bin/bash
set -eux

# Install AWS CLI
apt-get update -y
apt-get install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install Docker
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
sudo apt-get install -y jq

mkdir -p /app

# Retrieve App Configuration from Secrets Manager (Primedeal)
# Fetch the secret JSON string
SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id ${app_secret_id} --region ${region} --query SecretString --output text)
# Convert JSON to key=value format for env-file
echo "$SECRETS_JSON" | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' > /app/env.list

# Retrieve DB Password from Secrets Manager

# 1. Fetch the raw password from Secrets Manager
RAW_PASS=$(aws secretsmanager get-secret-value --secret-id ${secret_id} --region ${region} --query SecretString --output text)

# 2. URL-encode the password
ENCODED_PASS=$(printf %s $RAW_PASS | jq -sRr @uri)

# 3. Construct the full DATABASE_URL

export DATABASE_URL="mysql://admin:$ENCODED_PASS@${db_host}:${db_port}/primedeal"
# Run Application
docker pull deepanshu770/primedeal:${image_tag}
docker rm -f primedeal || true

docker run -d --name primedeal -p 80:3000 \
  --env-file /app/env.list \
  -e DATABASE_URL=$DATABASE_URL \
  deepanshu770/primedeal:${image_tag}




