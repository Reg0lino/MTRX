#!/bin/bash

# Default commit message if none provided
COMMIT_MESSAGE=\"Update local changes\"

# Check if a commit message was passed as an argument
if [ -n \"$1\" ]; then
  COMMIT_MESSAGE=\"$1\"
fi

echo \"Staging all changes...\"
git add .

echo \"Committing with message: $COMMIT_MESSAGE\"
git commit -m \"$COMMIT_MESSAGE\"

echo \"Pushing to origin master...\"
git push origin master

echo \"Done.\"
