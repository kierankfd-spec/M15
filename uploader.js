#!/usr/bin/env node

// uploader.js
// Usage examples in README.md

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

function usageAndExit() {
  console.error(`Usage:
  GITHUB_TOKEN=ghp_... node uploader.js --local ./path/to/file --repo-path path/in/repo --owner owner --repo repo --message "commit message"

Or to upload base64 content:
  GITHUB_TOKEN=ghp_... node uploader.js --base64 "<BASE64>" --repo-path path/in/repo --owner owner --repo repo --message "commit message"
`);
  process.exit(1);
}

const argv = require('minimist')(process.argv.slice(2));

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Please set GITHUB_TOKEN environment variable (PAT with repo scope).');
  process.exit(1);
}

const owner = argv.owner || 'kierankfd-spec';
const repo = argv.repo || 'M15';
const repoPath = argv['repo-path'] || argv.repoPath;
const message = argv.message || 'Add file via uploader.js';

if (!repoPath) usageAndExit();

const octokit = new Octokit({ auth: token });

async function getFileSha() {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path: repoPath });
    if (Array.isArray(res.data)) {
      throw new Error('Path is a directory');
    }
    return res.data.sha;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function run() {
  let contentBase64;

  if (argv.local || argv.l) {
    const localPath = argv.local || argv.l;
    const buffer = fs.readFileSync(localPath);
    contentBase64 = buffer.toString('base64');
  } else if (argv.base64 || argv.b) {
    contentBase64 = argv.base64 || argv.b;
  } else {
    usageAndExit();
  }

  const sha = await getFileSha();

  const params = {
    owner,
    repo,
    path: repoPath,
    message,
    content: contentBase64,
    committer: { name: 'm15-uploader', email: 'm15-uploader@example.com' },
    author: { name: 'm15-uploader', email: 'm15-uploader@example.com' }
  };

  if (sha) params.sha = sha;

  const res = await octokit.repos.createOrUpdateFileContents(params);
  console.log('Committed:', res.data.content.html_url);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
