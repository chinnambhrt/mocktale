const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'ui');
const serviceDir = path.join(__dirname, 'service');
const publicDir = path.join(serviceDir, 'public');

console.log('Building UI...');

try {
    // Install UI dependencies
    console.log('Installing UI dependencies...');
    execSync('npm install', { cwd: uiDir, stdio: 'inherit' });

    // Build UI
    console.log('Running UI build...');
    execSync('npm run build', { cwd: uiDir, stdio: 'inherit' });

    // Ensure service/public exists
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Copy dist to public
    const distDir = path.join(uiDir, 'dist');
    console.log(`Copying from ${distDir} to ${publicDir}...`);

    // Helper to copy directory recursively
    function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    copyDir(distDir, publicDir);
    console.log('UI built and copied successfully!');

} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
