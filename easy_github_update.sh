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

# Check which branch we're on
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}You are currently on branch:${NC} ${YELLOW}$CURRENT_BRANCH${NC}"

# Make sure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}You need to be on the 'main' branch to update GitHub.${NC}"
    echo -e "${YELLOW}Running the branch fix first...${NC}"
    
    # First save any work
    git add .
    git commit -m "Saving work before branch fix"
    
    # Check if main exists locally
    if git show-ref --verify --quiet refs/heads/main; then
        echo -e "${YELLOW}Local main branch exists. Switching to it...${NC}"
        git checkout main
    else
        echo -e "${YELLOW}Creating local main branch tracking remote main...${NC}"
        git checkout -b main origin/main || git checkout -b main
    fi
    
    # Make sure main tracks origin/main
    git branch --set-upstream-to=origin/main main
    
    # Copy changes from the previous branch
    if git show-ref --verify --quiet refs/heads/$CURRENT_BRANCH; then
        echo -e "${YELLOW}Copying your changes from $CURRENT_BRANCH to main...${NC}"
        git merge $CURRENT_BRANCH --no-edit
        echo -e "${GREEN}✓ Your changes have been copied to main!${NC}"
    fi
    
    CURRENT_BRANCH="main"
    echo -e "${GREEN}✓ Now working on branch:${NC} ${YELLOW}$CURRENT_BRANCH${NC}"
    echo
fi

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
    
    # Try to commit the merge resolution
    git add .
    git commit -m "Resolved merge conflicts"
    echo -e "${GREEN}✓ Conflict resolution saved!${NC}"
fi
echo

# STEP 3: Push your changes to GitHub
echo -e "${BLUE}STEP 3:${NC} Sending your changes to GitHub..."
commit_message="${1:-Update from local machine}" # Gets message from command line or uses default

# Create a new commit with the message
git add .
git commit -m "$commit_message"

# Push to GitHub - use the current branch name
echo -e "${YELLOW}Pushing to branch: ${CURRENT_BRANCH}${NC}"
git push origin ${CURRENT_BRANCH}

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! Your changes are now on GitHub!${NC}"
else
    echo -e "${RED}! There was a problem sending your changes to GitHub.${NC}"
    echo -e "${YELLOW}Try running the Fix Branches script first.${NC}"
fi
echo

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
read -p "Press Enter to close window..." 