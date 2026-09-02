#!/usr/bin/env node

// downloader.js
// Simple downloader that fetches a file from the repo and writes it locally.

const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const argv = require('minimist')(process.argv.slice(2));
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Please set GITHUB_TOKEN environment variable (PAT with repo scope).');
  process.exit(1);
}
const owner = argv.owner || 'kierankfd-spec';
const repo = argv.repo || 'M15';
const repoPath = argv['repo-path'] || argv.repoPath;
const out = argv.out || argv.o || null;

if (!repoPath) {
  console.error('Usage: GITHUB_TOKEN=ghp_... node downloader.js --repo-path path/in/repo --out ./localfile --owner owner --repo repo');
  process.exit(1);
}

const octokit = new Octokit({ auth: token });

async function run() {
  const res = await octokit.repos.getContent({ owner, repo, path: repoPath });
  if (Array.isArray(res.data)) throw new Error('Path is a directory');

  const contentBase64 = res.data.content;
  const buffer = Buffer.from(contentBase64, 'base64');
  const outPath = out || repoPath.split('/').pop();
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote', outPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
