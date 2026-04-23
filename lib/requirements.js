import { execSync } from 'child_process';
import which from 'which';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function checkRequirements() {
    const results = {
        node: true,
        ffmpeg: false,
        chrome: false,
        errors: []
    };

    // 1. Check FFmpeg
    try {
        await which('ffmpeg');
        results.ffmpeg = true;
    } catch (e) {
        if (fs.existsSync('C:\\ffmpeg\\bin\\ffmpeg.exe')) {
            results.ffmpeg = true;
        } else {
            results.errors.push("FFmpeg not found. Install it or add it to your PATH (or extract at C:\\ffmpeg).");
        }
    }

    // 2. Check Chrome
    const chromePaths = [
        path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe')
    ];

    for (const p of chromePaths) {
        if (fs.existsSync(p)) {
            results.chrome = p;
            break;
        }
    }

    if (!results.chrome) {
        results.errors.push("Google Chrome not found in standard paths.");
    }

    return results;
}

export function printStatus(results) {
    console.log(chalk.bold("\n=== Requirements Check ==="));
    console.log(`${results.node ? chalk.green('✔') : chalk.red('✘')} Node.js`);
    console.log(`${results.ffmpeg ? chalk.green('✔') : chalk.red('✘')} FFmpeg`);
    console.log(`${results.chrome ? chalk.green('✔') : chalk.red('✘')} Google Chrome`);
    
    if (results.errors.length > 0) {
        console.log(chalk.yellow("\nPending:"));
        results.errors.forEach(err => console.log(chalk.red(`- ${err}`)));
    } else {
        console.log(chalk.green("\n✨ Everything is ready to go!"));
    }
}
