#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========= FIX GITHUB BRANCHES ==========${NC}"
echo -e "${YELLOW}This script will fix your branch setup to prevent conflicts${NC}"
echo

# STEP 1: Check which branch we're on
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}You are currently on branch:${NC} ${YELLOW}$CURRENT_BRANCH${NC}"
echo

# STEP 2: Make sure our local main branch exists and tracks remote main
echo -e "${BLUE}STEP 1:${NC} Setting up main branch..."

# First save any work
git add .
git commit -m "Saving work before branch fix"

# If we're not on main, try to create/switch to it
if [ "$CURRENT_BRANCH" != "main" ]; then
    # Check if main exists locally
    if git show-ref --verify --quiet refs/heads/main; then
        echo -e "${YELLOW}Local main branch exists. Switching to it...${NC}"
        git checkout main
    else
        echo -e "${YELLOW}Creating local main branch tracking remote main...${NC}"
        git checkout -b main origin/main || git checkout -b main
    fi
fi

# Make sure main tracks origin/main
git branch --set-upstream-to=origin/main main

echo -e "${GREEN}✓ Your local 'main' branch is now properly set up!${NC}"
echo

# STEP 3: Copy changes from master branch if needed
if [ "$CURRENT_BRANCH" != "main" ] && git show-ref --verify --quiet refs/heads/$CURRENT_BRANCH; then
    echo -e "${BLUE}STEP 2:${NC} Copying your changes from $CURRENT_BRANCH to main..."
    
    # Merge changes from the previous branch
    git merge $CURRENT_BRANCH --no-edit
    
    echo -e "${GREEN}✓ Your changes have been copied to main!${NC}"
    echo
fi

echo -e "${BLUE}========= ALL DONE! ==========${NC}"
echo -e "${GREEN}Your repository is now set up correctly to use main branch.${NC}"
echo -e "${YELLOW}From now on, use the 'Get from GitHub.bat' and 'Update GitHub.bat' scripts${NC}"
read -p "Press Enter to close window..." 