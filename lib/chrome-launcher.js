import { spawn } from 'child_process';
import axios from 'axios';
import chalk from 'chalk';

const DEBUG_URL = "http://127.0.0.1:9222/json/version";

export async function ensureChromeDebug(chromePath) {
    try {
        const response = await axios.get(DEBUG_URL, { timeout: 2000 });
        if (response.status === 200) {
            console.log(chalk.cyan("ℹ Chrome is already open in debug mode."));
            return true;
        }
    } catch (error) {
        console.log(chalk.yellow("⚠ Chrome not detected in debug mode. Attempting to launch..."));
        
        if (!chromePath) {
            throw new Error("Chrome path not provided.");
        }

        const chrome = spawn(chromePath, [
            "--remote-debugging-port=9222",
            "--no-first-run",
            "--no-default-browser-check",
            "about:blank"
        ], {
            detached: true,
            stdio: 'ignore'
        });

        chrome.unref();

        for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 1000));
            try {
                const res = await axios.get(DEBUG_URL);
                if (res.status === 200) {
                    console.log(chalk.green("✔ Chrome successfully started in debug mode!"));
                    return true;
                }
            } catch (e) {}
        }
        
        throw new Error("Failed to automatically launch Chrome in debug mode.");
    }
}
