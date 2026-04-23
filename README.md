# 🚀 M3U8 Video Downloader v2.0

A powerful and automated tool for downloading videos and navigating lessons on course platforms (LMS).

## ✨ Features

- **💾 Automatic Download**: Detects m3u8 streams and downloads them in 720p quality.
- **🤖 Navigation Automation**: Automatically moves to the next lesson once the download is complete.
- **📁 Smart Organization**: Files are named based on lesson titles and indices detected on the page.
- **🌐 Quick Chrome Launch**: Automatically opens Chrome in debug mode if needed.
- **🛠 Interactive CLI**: A simple menu to manage requirements and start the process.

## 📋 Prerequisites

1. **Google Chrome** installed.
2. **FFmpeg** installed and added to your PATH (or in `C:\ffmpeg`).
3. **Node.js** (version 16 or higher).

## 🚀 How to Use

1. Clone the repository:
   ```bash
   git clone https://github.com/cegware/m3u8-video-downloader.git
   cd m3u8-video-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the script:
   ```bash
   npm start
   ```

4. From the menu, select **▶ Start Video Capture**.
5. Open the desired video in Chrome and press play. The download will start automatically, and the script will navigate through the playlist by itself.

## 🛠 Technologies

- [Puppeteer](https://pptr.dev/) - Browser control.
- [Inquirer](https://github.com/SBoudrias/Inquirer.js/) - CLI interface.
- [FFmpeg](https://ffmpeg.org/) - Video processing.
- [Chalk](https://github.com/chalk/chalk) - Terminal styling.

## 📝 Disclaimer

This project was created for educational and personal backup purposes. Using this tool to download copyrighted content without permission may violate the terms of service of the platform. Use responsibly.

---

