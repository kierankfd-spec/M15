# M15 - ChatGPT File Uploader

This branch adds a simple Node.js uploader and downloader that let you programmatically upload and download files to/from the repository using a GitHub Personal Access Token (PAT).

Files added:
- uploader.js — upload local files or base64 content to the repo
- downloader.js — download files from the repo to local disk
- package.json — minimal dependencies (@octokit/rest)
- .gitignore — node_modules
- README.md — usage and setup instructions
- example/test-file.txt — small test file

Security notes:
- Create a PAT with `repo` scope and store it securely (do not commit it). The scripts read GITHUB_TOKEN from environment variables.
- For large files (>100 MB) use external storage (S3, Git LFS).

I will open a PR after you review these changes.
