<<<<<<< HEAD
#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========= EASY GITHUB UPDATE SCRIPT ==========${NC}"
echo -e "${YELLOW}This script will safely update your GitHub repository${NC}"
echo

# STEP 1: Save your work locally
echo -e "${BLUE}STEP 1:${NC} Saving your changes locally..."
git add .
git commit -m "Saving local changes before updating from GitHub"
echo -e "${GREEN}✓ Local changes saved!${NC}"
echo

# STEP 2: Get the latest changes from GitHub
echo -e "${BLUE}STEP 2:${NC} Getting latest changes from GitHub..."
echo -e "${YELLOW}This might take a moment...${NC}"
git pull origin main --no-edit

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully got the latest changes from GitHub!${NC}"
else
    echo -e "${RED}! There was a problem getting the latest changes.${NC}"
    echo -e "${YELLOW}You might need to fix some conflicts manually.${NC}"
    read -p "Press Enter when you've fixed any conflicts (or Ctrl+C to quit)..."
fi
echo

# STEP 3: Push your changes to GitHub
echo -e "${BLUE}STEP 3:${NC} Sending your changes to GitHub..."
commit_message="${1:-Update from local machine}" # Gets message from command line or uses default

# Create a new commit with the message
git add .
git commit -m "$commit_message"

# Push to GitHub
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! Your changes are now on GitHub!${NC}"
else
    echo -e "${RED}! There was a problem sending your changes to GitHub.${NC}"
    echo -e "${YELLOW}Try running this script again later.${NC}"
fi
echo

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
=======
#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========= EASY GITHUB UPDATE SCRIPT ==========${NC}"
echo -e "${YELLOW}This script will safely update your GitHub repository${NC}"
echo

# STEP 1: Save your work locally
echo -e "${BLUE}STEP 1:${NC} Saving your changes locally..."
git add .
git commit -m "Saving local changes before updating from GitHub"
echo -e "${GREEN}✓ Local changes saved!${NC}"
echo

# STEP 2: Get the latest changes from GitHub
echo -e "${BLUE}STEP 2:${NC} Getting latest changes from GitHub..."
echo -e "${YELLOW}This might take a moment...${NC}"
git pull origin main --no-edit

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully got the latest changes from GitHub!${NC}"
else
    echo -e "${RED}! There was a problem getting the latest changes.${NC}"
    echo -e "${YELLOW}You might need to fix some conflicts manually.${NC}"
    read -p "Press Enter when you've fixed any conflicts (or Ctrl+C to quit)..."
fi
echo

# STEP 3: Push your changes to GitHub
echo -e "${BLUE}STEP 3:${NC} Sending your changes to GitHub..."
commit_message="${1:-Update from local machine}" # Gets message from command line or uses default

# Create a new commit with the message
git add .
git commit -m "$commit_message"

# Push to GitHub
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! Your changes are now on GitHub!${NC}"
else
    echo -e "${RED}! There was a problem sending your changes to GitHub.${NC}"
    echo -e "${YELLOW}Try running this script again later.${NC}"
fi
echo

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
>>>>>>> cdbbf261a3ab69cb84b3e54b4422ae97e4c4b0ad
read -p "Press Enter to close window..." 