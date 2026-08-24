# 🎬 Auto Cap's Style — Alok Video Editor

> **AI-Powered Animated Captions & Subtitle Studio for DaVinci Resolve**  
> *Seamlessly create, style, animate, and burn-in viral social media captions (Reels, TikTok, Shorts, YouTube) with 1-click timeline integration.*

---

## 🌟 Key Features

- **⚡ 1-Click Timeline Auto-Extraction**: Automatically extracts all subtitle items from your active DaVinci Resolve timeline with frame-accurate timing.
- **🎨 Modern Desktop Studio Layout**: Pure 3-column workspace with live interactive Remotion canvas preview, real-time font rendering, and color customization.
- **✨ 10+ Pro Entrance Animations**:
  - `Slide Left` *(Smooth Left-to-Right Conveyor Slide)*
  - `Slide Right` *(Smooth Right-to-Left Conveyor Slide)*
  - `Slide Up` *(Silky-smooth vertical arrival)*
  - `Pop` *(Snappy scale-bounce entrance)*
  - `Fade` *(Clean opacity transitions)*
  - `Typewriter` *(Letter-by-letter live typing)*
  - `Elastic` *(Spring-loaded overshoot bounce)*
  - `Kinetic` *(Directional clash collision)*
  - `Chaos` *(Energetic 3D orbital convergence)*
  - `3-Way Focus` *(Dynamic 3-line past/current/future subtitle view)*
- **🎤 Advanced Karaoke Engine**: Word-by-word active tracking, cumulative karaoke mode, and smooth color fade transitions (`Fade In & Out`, `Fade In Only`, `Fade Out Only`, `Snap`).
- **🔤 Dual Font & Typography Control**:
  - Independent Base Font and Highlight Font selection.
  - Custom font size multipliers, line spacing, and word spacing.
  - Case transforms (UPPERCASE, Title Case, lowercase).
- **💡 Drop Shadows & Inner Glow**:
  - Full control over shadow opacity, distance, angle, and blur radius.
  - Dedicated controls for base text and highlighted text.
  - Radiant glow with configurable intensity.
- **💎 Alpha Channel Transparency Export**:
  - Export ultra-crisp ProRes 4444 `.mov` files with **100% transparent backgrounds** for drag-and-drop overlay on video tracks.
  - Standard MP4 video export with background video sync.
- **📁 Dedicated Media Pool Management**:
  - Automatically organizes rendered captions into a dedicated `📁Auto Caps Style` bin in your DaVinci Resolve Media Pool.
  - 1-click append to the playhead position on your active timeline.

---

## 💻 System Requirements

- **DaVinci Resolve**: Version 17, 18, 19, or newer *(Free or Studio)*
- **Python**: Version 3.10, 3.11, or 3.12 *(With PATH enabled)*
- **Node.js**: Version 18, 20 LTS, or newer

---

## 🚀 Installation Guide

### 🪟 Windows (Windows 10 & 11)

1. **Prerequisites**:
   - Install **Node.js LTS** from [nodejs.org](https://nodejs.org) *(Make sure to check "Add to PATH")*.
   - Install **Python 3.11** from [python.org](https://python.org) *(Make sure to check "Add python.exe to PATH")*.

2. **Install Script**:
   - Copy the folder `Auto Caps Style` (containing `Auto Cap's Style.lua`) into:
     ```
     C:\Users\<YourUsername>\AppData\Roaming\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Auto Caps Style\
     ```
     *(Shortcut: Press `Win + R`, paste `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\`, and hit Enter).*

3. **Launch**:
   - Open DaVinci Resolve.
   - In the top menu, go to: **Workspace ➡️ Scripts ➡️ Auto Caps Style ➡️ Auto Cap's Style**.

---

### 🍎 macOS (Apple Silicon M1/M2/M3/M4 & Intel)

1. **Prerequisites**:
   - Install **Node.js LTS** via installer from [nodejs.org](https://nodejs.org) or Homebrew:
     ```bash
     brew install node
     ```
   - Install **Python 3.11** from [python.org](https://python.org) or Homebrew:
     ```bash
     brew install python@3.11
     ```

2. **Install Script**:
   - Copy the `Auto Caps Style` folder into:
     ```
     ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/Auto Caps Style/
     ```
     *(In Finder, press `Cmd + Shift + G`, paste the path above, and press Enter).*

3. **Launch**:
   - Open DaVinci Resolve.
   - Go to: **Workspace ➡️ Scripts ➡️ Auto Caps Style ➡️ Auto Cap's Style**.

---

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch)

1. **Prerequisites**:
   - Install Node.js and Python 3.11 via terminal:
     ```bash
     # Ubuntu / Debian
     sudo apt update && sudo apt install -y nodejs npm python3.11 python3.11-venv python3-pip

     # Arch Linux
     sudo pacman -S nodejs npm python
     ```

2. **Install Script**:
   - Copy the `Auto Caps Style` folder into:
     ```
     ~/.local/share/DaVinciResolve/Fusion/Scripts/Utility/Auto Caps Style/
     ```
     *or for system-wide installation:*
     ```
     /opt/resolve/Fusion/Scripts/Utility/Auto Caps Style/
     ```

3. **Launch**:
   - Open DaVinci Resolve.
   - Go to: **Workspace ➡️ Scripts ➡️ Auto Caps Style ➡️ Auto Cap's Style**.

---

## 📖 How to Use

1. **Create Subtitles in DaVinci Resolve**:
   - Add a Subtitle track to your timeline in DaVinci Resolve and generate/type your captions.
2. **Open Auto Cap's Style**:
   - Run the plugin from **Workspace ➡️ Scripts ➡️ Auto Caps Style**.
   - Your subtitles will load instantly with accurate frame timing.
3. **Customize Design**:
   - Select your favorite fonts, highlight colors, and entrance animations (`Slide Left`, `Slide Up`, `Pop`, etc.).
   - Choose word-by-word karaoke or line-by-line reveal.
4. **Render & Sync**:
   - Click **`RENDER FINAL VIDEO`**.
   - When render completes, your animated transparent caption video will be placed directly on your timeline at the playhead!

---

## 🛠️ Troubleshooting

- **"Python 3.11 Required" Alert**:
  - Install Python from [python.org](https://www.python.org/downloads/) and ensure **"Add Python to PATH"** was checked during setup.
- **"Node.js Required" Alert**:
  - Install Node.js LTS from [nodejs.org](https://nodejs.org/).
- **Subtitles Not Loading**:
  - Ensure your timeline contains a Subtitle track with at least one subtitle item, then click **"Re-Analyze Timeline Caption"**.

---

## 📄 License & Support

- **Created by**: [Alok Video Editor](https://alokvideoeditor.com)
- **Support & Updates**: Contact via Payhip or GitHub Issues.
- *Protected Proprietary Software — All Rights Reserved.*
