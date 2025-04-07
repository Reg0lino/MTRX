<<<<<<< HEAD
#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========= GET LATEST FROM GITHUB ==========${NC}"
echo -e "${YELLOW}This script will get the latest updates from GitHub${NC}"
echo

# STEP 1: Save any local changes first to prevent losing work
echo -e "${BLUE}STEP 1:${NC} Saving your changes locally..."
git add .
git commit -m "Saving local changes before updating from GitHub"
echo -e "${GREEN}✓ Local changes saved!${NC}"
echo

# STEP 2: Get the latest changes from GitHub
echo -e "${BLUE}STEP 2:${NC} Getting latest changes from GitHub..."
echo -e "${YELLOW}This might take a moment...${NC}"

# First figure out which branch we're using locally
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}You are currently on branch:${NC} ${YELLOW}$CURRENT_BRANCH${NC}"

# Pull from main branch (GitHub's default)
git pull origin main --no-edit

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully got the latest changes from GitHub!${NC}"
else
    echo -e "${RED}! There was a problem getting the latest changes.${NC}"
    echo -e "${YELLOW}You might need to fix some conflicts manually.${NC}"
    read -p "Press Enter when you've fixed any conflicts (or Ctrl+C to quit)..."
    
    # Try to commit the merge resolution
    git add .
    git commit -m "Resolved merge conflicts"
    
    echo -e "${GREEN}✓ Conflict resolution saved!${NC}"
fi
echo

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
echo -e "${YELLOW}You now have the latest changes from GitHub.${NC}"
echo -e "${YELLOW}No changes were pushed to GitHub.${NC}"
=======
#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========= GET LATEST FROM GITHUB ==========${NC}"
echo -e "${YELLOW}This script will get the latest updates from GitHub${NC}"
echo

# STEP 1: Save any local changes first to prevent losing work
echo -e "${BLUE}STEP 1:${NC} Saving your changes locally..."
git add .
git commit -m "Saving local changes before updating from GitHub"
echo -e "${GREEN}✓ Local changes saved!${NC}"
echo

# STEP 2: Get the latest changes from GitHub
echo -e "${BLUE}STEP 2:${NC} Getting latest changes from GitHub..."
echo -e "${YELLOW}This might take a moment...${NC}"

# First figure out which branch we're using locally
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}You are currently on branch:${NC} ${YELLOW}$CURRENT_BRANCH${NC}"

# Pull from main branch (GitHub's default)
git pull origin main --no-edit

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully got the latest changes from GitHub!${NC}"
else
    echo -e "${RED}! There was a problem getting the latest changes.${NC}"
    echo -e "${YELLOW}You might need to fix some conflicts manually.${NC}"
    read -p "Press Enter when you've fixed any conflicts (or Ctrl+C to quit)..."
    
    # Try to commit the merge resolution
    git add .
    git commit -m "Resolved merge conflicts"
    
    echo -e "${GREEN}✓ Conflict resolution saved!${NC}"
fi
echo

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
echo -e "${YELLOW}You now have the latest changes from GitHub.${NC}"
echo -e "${YELLOW}No changes were pushed to GitHub.${NC}"
>>>>>>> cdbbf261a3ab69cb84b3e54b4422ae97e4c4b0ad
read -p "Press Enter to close window..." 