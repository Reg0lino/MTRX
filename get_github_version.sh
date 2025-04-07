    #!/bin/bash

    echo "!!! WARNING !!!"
    echo "This will ERASE any local changes not on GitHub and match your files to GitHub's 'master' branch."
    echo "Press Ctrl+C NOW to cancel, or Enter to continue..."
    read -p "" # Wait for user to press Enter

    echo ">>> Getting latest info from GitHub (git fetch)..."
    git fetch origin
    echo ">>> Fetch finished."
    echo

    echo ">>> FORCING your local files to match GitHub's 'master' branch (git reset --hard)..."
    git reset --hard origin/master # Force local to match the downloaded 'master'
    echo ">>> Reset finished."
    echo

    echo ">>> Cleaning up any extra local files Git doesn't know about (git clean)..."
    git clean -fd # Remove untracked files and directories
    echo ">>> Cleanup finished."
    echo

    echo "--- Your local folder now matches GitHub's 'master' branch ---"
    read -p "Press Enter to close window..."