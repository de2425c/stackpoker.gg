#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Copy HTML files to public directory
cp index.html 404.html public/

echo "Build completed!" 