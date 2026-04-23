import inquirer from 'inquirer';
import chalk from 'chalk';
import { checkRequirements, printStatus } from './lib/requirements.js';
import { ensureChromeDebug } from './lib/chrome-launcher.js';
import { startDownloader } from './lib/downloader.js';

const APP_NAME = "M3U8 Video Downloader v2.0";

async function showMenu() {
    console.clear();
    console.log(chalk.bold.cyan(`
    ╔════════════════════════════════════════════╗
    ║      🚀 ${APP_NAME}       ║
    ║      Course Lesson & Playlist Automator    ║
    ╚════════════════════════════════════════════╝
    `));

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do? (use arrows ↕):',
            loop: false,
            choices: [
                new inquirer.Separator('  --- MAIN ACTIONS ---'),
                { name: '  1) ▶  Start Video Capture', value: 'start' },
                { name: '  2) 🛠  Check System Requirements', value: 'check' },
                new inquirer.Separator('  --- INFORMATION ---'),
                { name: '  3) 📖 User Guide (How it works?)', value: 'guide' },
                { name: '  4) ℹ  About the Project', value: 'about' },
                new inquirer.Separator('  --- SYSTEM ---'),
                { name: '  0) ❌ Exit', value: 'exit' }
            ]
        }
    ]);

    switch (action) {
        case 'start':
            await handleStart();
            break;
        case 'check':
            const reqs = await checkRequirements();
            printStatus(reqs);
            await waitForKey();
            showMenu();
            break;
        case 'guide':
            showGuide();
            await waitForKey();
            showMenu();
            break;
        case 'about':
            console.log(chalk.white(`
            ${chalk.bold.cyan(APP_NAME)}
            Developed to facilitate personal backups of educational content.
            Version: 2.0.0
            License: MIT

            This script uses Puppeteer to monitor m3u8 requests
            and FFmpeg to process and save videos in MP4 format.
            `));
            await waitForKey();
            showMenu();
            break;
        case 'exit':
            console.log(chalk.yellow("\nExiting... See you later! 👋"));
            process.exit(0);
    }
}

function showGuide() {
    console.log(chalk.bold.yellow("\n📖 QUICK USER GUIDE:"));
    console.log(`
    1. Make sure ${chalk.cyan('FFmpeg')} is installed.
    2. In the main menu, select ${chalk.green('Start Video Capture')}.
    3. The script will try to open ${chalk.blue('Chrome')} in debug mode.
    4. In the Chrome window that opens, login to your platform.
    5. Navigate to your lesson and press ${chalk.green('PLAY')}.
    6. The terminal will show the download progress.
    7. Once finished, it will automatically navigate to the next lesson!
    `);
}

async function handleStart() {
    const reqs = await checkRequirements();
    if (!reqs.ffmpeg) {
        console.log(chalk.red("\n❌ ERROR: FFmpeg not detected!"));
        console.log(chalk.gray("Please install FFmpeg or add it to your PATH before continuing."));
        await waitForKey();
        return showMenu();
    }

    try {
        await ensureChromeDebug(reqs.chrome);
        await startDownloader();
    } catch (error) {
        console.error(chalk.red("\n❌ FAILED TO START:"), error.message);
        await waitForKey();
        showMenu();
    }
}

async function waitForKey() {
    console.log(chalk.gray("\nPress [Enter] to return to the menu..."));
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
}

showMenu();
