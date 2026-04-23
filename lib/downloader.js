import puppeteer from "puppeteer";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const DOWNLOAD_DIR = path.resolve("./downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

const downloaded = new Set();

export async function startDownloader() {
    console.log(chalk.blue("\n🔗 Connecting to Chrome..."));

    try {
        const browser = await puppeteer.connect({
            browserURL: "http://127.0.0.1:9222",
            defaultViewport: null
        });

        const pages = await browser.pages();
        pages.forEach(p => attachListener(p));

        browser.on("targetcreated", async target => {
            if (target.type() === "page") {
                const page = await target.page();
                attachListener(page);
            }
        });

        console.log(chalk.green("🟢 Monitoring Active!"));
        console.log("⚡ Play a video on your platform to start the download.");

    } catch (error) {
        console.error(chalk.red("❌ Connection Error:"), error.message);
    }
}

function attachListener(page) {
    page.on("request", async req => {
        const url = req.url();
        if (!url.includes(".m3u8") || !url.includes("playlist.m3u8") || downloaded.has(url)) return;
        
        downloaded.add(url);
        console.log(chalk.yellow("\n🔍 Video detected! Analyzing page..."));

        try {
            const pageData = await extractMetadata(page);
            let fileTitle = pageData.title || `video_${Date.now()}`;
            fileTitle = fileTitle.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
            
            if (pageData.index) {
                fileTitle = `${String(pageData.index).padStart(2, '0')} - ${fileTitle}`;
            }

            const targetUrl = url.replace("playlist.m3u8", "720p/video.m3u8");
            const headers = req.headers();
            let headerString = "";
            if (headers["user-agent"]) headerString += `User-Agent: ${headers["user-agent"]}\r\n`;
            if (headers["referer"]) headerString += `Referer: ${headers["referer"]}\r\n`;

            const filename = `${fileTitle}.mp4`;
            const output = path.join(DOWNLOAD_DIR, filename);

            console.log(chalk.cyan(`🎯 Downloading: ${filename}`));
            
            downloadWithFFmpeg(targetUrl, headerString, output, () => {
                console.log(chalk.green(`✅ Completed: ${filename}`));
                autoNavigate(page);
            });

        } catch (err) {
            console.error(chalk.red("⚠ Processing Error:"), err.message);
        }
    });
}

async function extractMetadata(page) {
    return await page.evaluate(() => {
        const currentPath = window.location.pathname;
        const cards = Array.from(document.querySelectorAll('div[data-testid="card-lesson-container"]'));
        const pathSegments = currentPath.split('/').filter(p => p);
        const currentId = pathSegments[pathSegments.length - 1];

        const activeIndex = cards.findIndex(card => {
            const link = card.querySelector('a');
            return link && (link.getAttribute('href').includes(currentId) || currentPath.includes(link.getAttribute('href')));
        });

        let title = document.title;
        if (activeIndex !== -1) {
            const card = cards[activeIndex];
            const p = Array.from(card.querySelectorAll('p')).reverse().find(t => {
                const txt = t.innerText.trim();
                return txt && !/conclu[íi]da|em andamento|assistido/i.test(txt) && !/^\d/.test(txt);
            });
            if (p) title = p.innerText.trim();
        }

        return {
            index: activeIndex !== -1 ? activeIndex + 1 : null,
            title: title
        };
    });
}

function downloadWithFFmpeg(url, headers, output, callback) {
    const ffmpeg = spawn("ffmpeg", [
        "-y", "-headers", headers, "-i", url, "-c", "copy", "-bsf:a", "aac_adtstoasc", output
    ], { stdio: "ignore" });

    ffmpeg.on('close', (code) => {
        if (code === 0) callback();
        else console.error(chalk.red(`❌ FFmpeg Error (Code ${code})`));
    });
}

async function autoNavigate(page) {
    console.log(chalk.gray("⏳ Navigating to next lesson in 5s..."));
    await new Promise(r => setTimeout(r, 5000));

    try {
        const result = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('div[data-testid="card-lesson-container"]'));
            const currentPath = window.location.pathname;
            const currentId = currentPath.split('/').filter(p => p).pop();

            const idx = cards.findIndex(c => c.querySelector('a')?.getAttribute('href').includes(currentId));
            if (idx !== -1 && idx < cards.length - 1) {
                cards[idx + 1].querySelector('a').click();
                return "NEXT_LESSON";
            }

            const btn = Array.from(document.querySelectorAll('button')).find(b => 
                /próximo módulo|ir para o próximo/i.test(b.innerText)
            );
            if (btn) {
                btn.click();
                return "NEXT_MODULE";
            }
            return "END";
        });
        console.log(chalk.blue(`🤖 Automation: ${result}`));
    } catch (e) {
        console.error(chalk.yellow("⚠ Auto-navigation failed."));
    }
}
