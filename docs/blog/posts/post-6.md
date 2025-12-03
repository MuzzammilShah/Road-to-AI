---
title: Clean up `.DS_Store` after pushing to GitHub
date:
  created: 2025-11-14
categories:
  - MISC
---

<div align="center">
<img src="/assets/images/blog-assets/thumbnails/post-6.png" alt="Post 6 Thumbnail" width="100%">
</div>

<!-- more -->

<div align="center" style="font-size: 0.7em; font-style: italic;">The logo on this thumbnail is of the <a href="https://apps.apple.com/us/app/ds-store-cleaner/id6748859939?mt=12" target="_blank" style="text-decoration: none; color: inherit;">DS_Store cleaner app</a> from App Store for Mac. I don’t use it in the tutorial below (haven’t tried it yet either), but the goal is the same, so I used it here haha.</div>

&nbsp;

# Clean up `.DS_Store` after pushing to GitHub

If you are a new Mac user like me then you might have noticed that your GitHub repo suddenly contains a new file called `.DS_Store`. It took me a while to understand what it was and how I can remove it. So without any other unnecessary detail, I have provided a set of commands to run to first remove it from your repo. After that, if you are still interested, you can read what that file is along with a simple breakdown explaining what the commands you ran actually do.

!!! info "Important Note"
    If you have been using web frameworks to build your project or had used a coding agent to make your spaces, then your `.gitignore` file prolly already handles ignoring this file. So you don't need to go further in this blog, you are already set. But if you are like me and had already pushed your personal projects to GitHub (cloud), and would like to remove it and prevent this from happening in future pushes, then this is for you.

&nbsp;

## **Commands to run**
-----

**Step 1: Add the following to your `.gitignore` file**

```
# macOS Finder files
.DS_Store
._*

# macOS external disk files & Trash etc
.Spotlight-V100
.Trashes
.VolumeIcon.icns

# Thumbnail cache, external drives
Thumbs.db
Desktop.ini

# Editor/IDE temporary files
*~ 
*.swp
```

**Step 2: Add the edited file and commit**

```
git add .gitignore
git commit -m "Add .gitignore entries to ignore macOS OS files (.DS_Store etc)"
```

**Step 3: Remove the already tracked files from version control**

```
find . -name .DS_Store -print0 | xargs -0 git rm --cached --ignore-unmatch
```
This finds all `.DS_Store` files under the repo and removes them from the Git index (not deleting them locally).

If you have a *directory* which you would like to remove, then run this command instead:

```
find . -type d -name .vscode -print0 | xargs -0 git rm --cached -r --ignore-unmatch
```

**Step 4: Commit the removal of those files**

```
git commit -m "Remove .DS_Store files from repository"
```

**Step 5: Push your changes (so the remote origin reflects the removal and new .gitignore)**

```
git push origin main
```
^ or whichever branch you are working on

And that was it, all done. You’ll now be in a clean state. No more `.DS_Store` tracked, and your `.gitignore` in each repo will prevent adding new ones.

&nbsp;

## **What was that file and What is it that we did?**
-----

### ✅ **What is `.DS_Store`**

- On macOS, the `.DS_Store` file is a hidden file that the system (specifically the Finder) creates in folders in order to store metadata about views: icon positions, window size, background image, reference, etc.
- It is not something you deliberately created for your code or project logic; it’s just macOS housekeeping.

### 💡 **Do you need to worry about it in a Git repo?**

- In general: no, it’s not a security risk in most cases. From one source:
"Whether it is going to be dangerous or not depends on whether there is anything that could be stored in that file in your particular directory … I suspect it is ‘no’ since you’ve presumably only had the project files …”
- It can cause clutter (lots of irrelevant files in your repo) and sometimes minor accidental leaks (filenames, perhaps folder structure) but it’s very unlikely to expose sensitive secrets by itself.
- Since your project is a website / code repo, unless you have placed some private configuration inside folders in a way where .DS_Store would capture private data (which is unlikely), you’re safe.
- That said, it is best practice to remove and ignore these files so your repository remains clean, avoid unnecessary noise/commits, and avoid confusion for collaborators.

### 🤔 **What happens after I run all those commands?**

If you work via branches (you said you mostly work on branches and then merge to main), the removal will propagate when you merge. If you removed the `.DS_Store` from main and future branches are based on that updated main, then merging new branches into main will keep `.DS_Store` files ignored and removed. You do not need to worry: once the `.gitignore` is in place and existing `.DS_Store` removed and committed, future merges won’t reintroduce those tracked `.DS_Store` files (provided that your branches don’t bring them back as tracked files). So yes, you are safe with your branch + merge workflow.

*Important note:* This process will not harm your project code. Removing `.DS_Store` from Git means you are simply telling Git to stop tracking that file. Your project logic, code files, etc remain intact. Just ensure you commit the removal and push, and your collaborators (or you, if solo) continue working normally.

### 🚀 **Commands you just ran**

`find . -name .DS_Store -print0 | xargs -0 git rm --cached --ignore-unmatch`

This command will:

- Remove the already tracked `.DS_Store` files (and similar) from version control (but not from your local working directories), so they are no longer tracked and will not show up in commits or merges.
- Find all `.DS_Store` files under the repo and remove them from the Git index (not deleting them locally).

`find . -type d -name .vscode -print0 | xargs -0 git rm --cached -r --ignore-unmatch`

This command will:

- Search for all directories named `.vscode` recursively.
- Use `git rm --cached -r` to remove those directories and their contents from the repository index, but leave them intact in your local working directory.
- The `--ignore-unmatch` flag avoids errors if no matches are found.

*Explanation*

- `find . -type d -name .vscode -print0`: Finds directories called `.vscode` from the current path down. `-print0` ensures filenames with spaces are handled.
- `xargs -0`: Reads the null-separated list from find and applies the next command to each.
- `git rm --cached -r --ignore-unmatch`: Removes the files in these directories from the repo (staging area) but not from disk, recursively.

### 🧠 **How can I avoid this in the future?**

Follow these steps to set up your Mac so future repos are safe by default (on terminal).

**Step 1: Create a global gitignore file**

```
nano ~/.gitignore_global
```

Inside, add patterns like:

```
# macOS junk files
.DS_Store
._*
.Spotlight-V100
.Trashes
.VolumeIcon.icns
Thumbs.db
Desktop.ini
```
^You can also include editor temporary files if you like (e.g., *~, *.swp) like we did above.

**Step 2: Tell Git to use this global ignore file:**

```
git config --global core.excludesfile ~/.gitignore_global
```

**Step 3: (Optional) Verify that Git knows about it:**

```
git config --global core.excludesfile
```
^ It should print ~/.gitignore_global (or the path you set).

And done! Going forward, when you start a new repository (clone or init), you won’t have to repeatedly add `.DS_Store` ignore patterns manually (though you still might want a `.gitignore` for project-specific patterns). This global ignore ensures OS junk files are ignored by default on your machine.

&nbsp;

Hope you found this useful, happy coding!

&nbsp;