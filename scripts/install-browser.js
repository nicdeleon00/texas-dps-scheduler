const { execSync } = require('child_process');
const { existsSync } = require('fs');

const isMac = process.platform === 'darwin';
const browser = process.arch === 'arm64' ? 'chromium' : 'chrome';

// On macOS, patchright cannot install the branded Chrome channel without sudo,
// and its bundled download script breaks on Google's redirect. Use the system
// Chrome install instead (the app launches it via channel: 'chrome').
if (isMac && browser === 'chrome') {
    if (existsSync('/Applications/Google Chrome.app')) {
        console.log('Google Chrome already installed, skipping browser install.');
        process.exit(0);
    }
    console.error('Google Chrome not found. Please install it from https://www.google.com/chrome/ and re-run npm install.');
    process.exit(1);
}

// --with-deps requires sudo on macOS and is only needed on Linux.
execSync(`npx patchright install ${isMac ? '' : '--with-deps '}--no-shell ${browser}`, { stdio: 'inherit' });
