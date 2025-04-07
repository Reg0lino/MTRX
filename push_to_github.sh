    #!/bin/bash

    # STEP 1: Check GitHub's 'main' branch for updates first!
    echo ">>> Checking GitHub 'main' branch for updates (git pull)..."
    git pull origin main # Try to merge changes from GitHub's main branch
    echo ">>> Pull finished."
    # If 'git pull' had merge conflicts, the script might pause here until you fix them manually.
    echo

    # STEP 2: Stage ALL local changes (new files, edits, deletions)
    echo ">>> Staging all changes (git add .)..."
    git add .
    echo ">>> Staging finished."
    echo

    # STEP 3: Commit the changes with a message
    commit_message="${1:-Update from local machine}" # Gets message from command line ($1) or uses default
    echo ">>> Committing changes with message: '$commit_message' (git commit)..."
    git commit -m "$commit_message"
    echo ">>> Commit finished."
    echo

    # STEP 4: Push the committed changes to GitHub's 'main' branch
    echo ">>> Sending changes to GitHub's 'main' branch (git push)..."
    git push origin main # Push your local commits to the 'main' branch on GitHub
    echo ">>> Push finished."
    echo

    echo "--- Script finished! Check GitHub's 'main' branch ---"
    read -p "Press Enter to close window..."