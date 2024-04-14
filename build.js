const fs = require('fs');
const esbuild = require('esbuild');
const path = require('path');

// Helper function to copy directories recursively
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
}

// Main build function
function buildGame() {
    // Read template file
    const template = fs.readFileSync('template.html', 'utf-8');
    let code = `<script src="/helper.js"></script>\n<script src="/game.js"></script>\n`;

    // Configuration for building scripts
    const buildConfig = [
        {
            entryPoints: ['code/main.js'],
            outfile: 'dist/game.js'
        },
        {
            entryPoints: ['helper.ts'],
            outfile: 'dist/helper.js'
        }
    ];

    try {
        // Run build for each config
        buildConfig.forEach(config => {
            esbuild.buildSync({
                ...config,
                bundle: true,
                sourcemap: true,
                target: 'es6',
                keepNames: true,
                logLevel: 'silent'
            });
        });

        // Write the modified template to the dist folder
        fs.writeFileSync('dist/index.html', template.replace('{{kaboom}}', code));

        // Copy assets
        copyDir('sprites', 'dist/sprites');
        copyDir('sounds', 'dist/sounds');

        console.log('The build is successful!');
    } catch (error) {
        // Handle and log errors
        const loc = error.errors[0].location;
        const errorMsg = `<pre>ERROR: ${error.errors[0].text}\n` +
                         `    -> ${loc.file}:${loc.line}:${loc.column}\n</pre>`;
        fs.writeFileSync('dist/index.html', errorMsg);

        console.error('ERROR:', error.errors[0].text);
        if (error.errors[0].stack) {
            error.errors[0].stack.forEach(trace => {
                console.error(`    -> ${trace.file}:${trace.line}:${trace.col}`);
            });
        }
    }
}

// Run build
buildGame();
