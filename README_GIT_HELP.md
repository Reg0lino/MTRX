# Git Help Guide for MTRX Project

## What's In This Folder

I found a test file (named "test") that contains:
```
test123
```

## How to Fix GitHub Sync Issues

I fixed all the merge conflicts in your files! Here's what you need to do:

### First Time: Fix Your Branches

1. Double-click `Fix Branches.bat`
   - This will make sure you're using the `main` branch (GitHub's default)
   - It will copy everything from your `master` branch to `main`

### To Get Updates FROM GitHub

1. Double-click `Get from GitHub.bat`
   - This only downloads changes from GitHub
   - It won't try to upload anything

### To Upload Your Changes TO GitHub

1. Double-click `Update GitHub.bat`
   - This uploads your changes to GitHub
   - It checks for updates first to avoid conflicts

## What Was Fixed

1. All the merge conflicts are now resolved
2. Your scripts now use the `main` branch instead of `master`
3. The update script now checks which branch you're on before trying to push

The "test" file you created should be pushed to GitHub when you run the Update GitHub script!

## If You Still Have Problems

If you run into any issues:
1. Run `Fix Branches.bat` first
2. Then try `Update GitHub.bat` again

Remember: GitHub uses "main" as the default branch, not "master". 