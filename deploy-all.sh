#!/bin/bash

# Exit on error
set -e

echo "===== Deploying StackPoker.gg ====="

# 1. First, build and deploy the Python backend to Cloud Run
echo "Deploying Python backend to Cloud Run..."
cd parser_backend

# Build and deploy to Cloud Run
gcloud run deploy stackpoker-parser-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

cd ..

# 2. Now deploy the Firebase Hosting with the rewrite to the Cloud Run service
echo "Deploying Firebase Hosting..."
firebase deploy --only hosting

echo "===== Deployment Complete ====="
echo "Your app should now be accessible at https://stack-24dea.web.app"
echo "The backend API is at https://stack-24dea.web.app/api/parse-hand" 