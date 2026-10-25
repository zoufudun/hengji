import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getGitHubToken } from './publish-release-github.mjs';

async function deploy() {
  const token = await getGitHubToken();
  const repoUrl = `https://x-access-token:${token}@github.com/zoufudun/hengji.git`;

  console.log('1. Pushing main branch...');
  try {
    execSync(`git push "${repoUrl}" main`, { stdio: 'inherit' });
    console.log('✔ main branch pushed.');
  } catch (e) {
    console.error('Failed to push main:', e.message);
  }

  console.log('2. Deploying build/desktop to gh-pages branch...');
  const buildDir = path.resolve('build', 'desktop');
  if (!fs.existsSync(buildDir)) {
    throw new Error('build/desktop directory not found! Run npm run pages:build first.');
  }

  fs.writeFileSync(path.join(buildDir, '.nojekyll'), '');

  const tempDir = path.resolve('.temp_gh_pages');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.cpSync(buildDir, tempDir, { recursive: true });

  execSync('git init', { cwd: tempDir, stdio: 'ignore' });
  execSync('git config user.name "PhudonZou"', { cwd: tempDir, stdio: 'ignore' });
  execSync('git config user.email "zoufudun@163.com"', { cwd: tempDir, stdio: 'ignore' });
  execSync('git checkout -b gh-pages', { cwd: tempDir, stdio: 'ignore' });
  execSync('git add -A', { cwd: tempDir, stdio: 'ignore' });
  execSync('git commit -m "deploy: update GitHub Pages with v0.7.9 fix"', { cwd: tempDir, stdio: 'ignore' });
  
  console.log('Pushing to gh-pages remote...');
  execSync(`git push --force "${repoUrl}" gh-pages`, { cwd: tempDir, stdio: 'inherit' });
  console.log('✔ gh-pages deployed successfully!');

  fs.rmSync(tempDir, { recursive: true, force: true });
}

deploy().catch(e => {
  console.error('Deployment error:', e);
  process.exit(1);
});
