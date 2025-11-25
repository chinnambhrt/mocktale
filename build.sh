#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

CONTAINER_TOOL=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --tool) CONTAINER_TOOL="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "$1 is not installed or not in PATH."
        exit 1
    fi
}

# 1. Check tools
check_command npm
check_command git

# 2. Determine Container Tool
if [ -z "$CONTAINER_TOOL" ]; then
    read -p "Enter container tool to use (docker/podman) [default: docker]: " input
    CONTAINER_TOOL=${input:-docker}
fi

if [ "$CONTAINER_TOOL" != "docker" ] && [ "$CONTAINER_TOOL" != "podman" ]; then
    echo "Invalid container tool. Use 'docker' or 'podman'."
    exit 1
fi
check_command "$CONTAINER_TOOL"

# 3. Get Branch Name
if ! BRANCH=$(git rev-parse --abbrev-ref HEAD); then
    echo "Failed to get git branch. Ensure this is a git repository."
    exit 1
fi

# Sanitize branch name for docker tag (replace invalid chars with -)
IMAGE_TAG=$(echo "$BRANCH" | sed 's/[^a-zA-Z0-9_.-]/-/g')

echo -e "\033[0;36mBuilding for branch: $BRANCH (Image tag: $IMAGE_TAG)\033[0m"

# 4. Build UI
echo -e "\033[0;36mBuilding UI...\033[0m"
cd ui
npm install
npm run build
cd ..

# 5. Move to service/static
echo -e "\033[0;36mMoving UI artifacts to service/static...\033[0m"
UI_DIST="ui/dist"
SERVICE_STATIC="service/static"

if [ ! -d "$UI_DIST" ]; then
    echo "UI dist folder not found at $UI_DIST"
    exit 1
fi

if [ -d "$SERVICE_STATIC" ]; then
    rm -rf "$SERVICE_STATIC"
fi
mkdir -p "$SERVICE_STATIC"
cp -r "$UI_DIST"/* "$SERVICE_STATIC"

# 6. Build Service (Install deps)
echo -e "\033[0;36mBuilding Service...\033[0m"
cd service
npm install
cd ..

# 7. Build Container Image
echo -e "\033[0;36mBuilding Container Image with $CONTAINER_TOOL...\033[0m"
"$CONTAINER_TOOL" build -t "mocktale:$IMAGE_TAG" .

echo -e "\033[0;32mBuild Complete! Image: mocktale:$IMAGE_TAG\033[0m"
