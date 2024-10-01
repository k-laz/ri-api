#!/bin/bash

# Ensure .env file exists
if [ ! -f .env ]; then
    echo ".env file not found!"
    exit 1
fi

# Loop through each line in the .env file
while IFS='=' read -r key value; do
    # Ignore comments and empty lines
    if [[ ! $key =~ ^# && -n $key ]]; then
        # Use flyctl to set the secret
        flyctl secrets set "$key=$value"
    fi
done < .env
