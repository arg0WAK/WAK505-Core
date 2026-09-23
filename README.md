![WAK505-Core Injection Page](https://arg0wak.github.io/gist/images/WAK505-Core/2396814214727830.webp)

**W.A.K.** (**W**ebKit **A**utomated **K**ernel) is a lightweight, modular, and automated WebKit/Kernel exploit host designed for PlayStation 4 firmware 5.05. 

The project departs from traditional monolithic scripts in favor of a clean, decoupled modular architecture. By isolating system calls, ROP gadget chains, userland memory primitives, and kernel patching routines into dedicated modules, WAK505-Core provides improved maintainability, cleaner code readability, and a streamlined execution flow.

Users can host the project on any standard static HTTP server or run it locally using tools like Five Server. For remote access without port forwarding, the local server can be tunneled via Cloudflare or NGROK.

## Features

- **Refactored and Stripped Core:** Redundant primitive payload and binloader functions have been entirely removed from the codebase to ensure a lighter, more stable execution. Remote payload injection can now be handled directly via GoldHEN or HEN.
- **Decoupled Modular Architecture:** Re-architected into discrete functional layers (syscalls, rop, userland, kernel) to minimize memory overhead and simplify maintenance.
- **Built-in Firmware Spoofer:** Integrated UI tooling for firmware target spoofing.
- **Automated Workflow:** Orchestrated execution lifecycle designed for automated caching and triggering.
- **AppCache Support:** Full offline caching capability via cache.manifest for network-independent usage.
- **XMB Like Interface:** Clean, low-overhead dark terminal aesthetic built for console browser rendering.

Directory Structure
-------------------
        ├── assets/
        │   └── index.css           # Hardened stylesheet for legacy WebKit
        ├── binaries/
        │   ├── app2usb.bin         # App2USB payload
        │   ├── backup.bin          # System backup payload
        │   ├── disable-updates.bin # Permanent update blocking payload
        │   ├── enable-updates.bin  # Update restore payload
        │   ├── goldhen.bin         # GoldHEN v2.4b payload
        │   ├── hen.bin             # HEN v2.2.0pl182 payload
        │   ├── history-blocker.bin # Browser history blocker payload
        │   ├── Kernel-Clock.bin    # Kernel clock synchronization payload
        │   ├── pup-decrypt.bin     # PUP decryption payload
        │   ├── restore.bin         # System restore payload
        │   └── rif-renamer.bin     # RIF license fixer payload
        ├── js/
        │   ├── helper.js           # UI state bindings and event handlers
        │   ├── kernel.js           # Kernel-level exploitation
        │   ├── memory.js           # Userland memory helpers
        │   ├── rop.js              # ROP chain constructor and gadget resolvers
        │   ├── spoofer.js          # Target firmware spoofing routine (writePL)
        │   ├── syscalls.js         # System call mappings and kernel offsets
        │   └── utils.js            # General helper and conversion utilities
        ├── cache.manifest          # Offline AppCache manifest
        ├── fiveserver.config.cjs   # Five Server local deployment configuration
        ├── index.html              # Main orchestrator interface
        └── README.md               # Project documentation

Deployment and Usage
--------------------

### PS4 User's Guide via Custom DNS (Recommended)

This method provides the most integrated and seamless experience. It routes the native PS4 User's Guide directly to the host while actively sinkholing Sony telemetry and update servers at the DNS level.

1. On your PS4, go to **Settings** > **Network** > **Set Up Internet Connection**.
2. Select your connection type (Wi-Fi or LAN Cable) and choose **Custom**.
3. Set **IP Address Settings** to **Automatic** and **DHCP Host Name** to **Do Not Specify**.
4. Set **DNS Settings** to **Manual**:
   * **Primary DNS:** `35.209.229.156`
   * **Secondary DNS:** `0.0.0.0` (or leave completely blank)
   > **Warning:** Never specify an external secondary DNS (such as `8.8.8.8` or `1.1.1.1`). An active secondary DNS can bypass the sinkhole if the primary query times out, exposing your console to official update servers.
5. Set **MTU Settings** to **Automatic** and **Proxy Server** to **Do Not Use**.
6. Navigate to **Settings** > **User's Guide / Helpful Info** > **User's Guide** to launch the exploit host.
7. After caching, go to **Settings** > **Network** and turn off your network connection.

---

### Standalone Web Browser (GitHub Pages)

If you prefer not to modify your network DNS settings, you can launch the host directly using the PS4 Internet Browser:

1. Open the **Internet Browser** on your PS4.
2. Navigate to: `http://arg0wak.github.io/WAK505-Core`
3. Add the page to your **Bookmarks** for quick access and allow the AppCache to complete for offline use.
4. **Critical Requirement:** Because this method does not utilize the custom DNS sinkhole, you **must run the Update Blocker payload** immediately from the tools grid to prevent accidental firmware upgrades.

> **Note:** For maximum stability, automatic telemetry blocking, and offline User's Guide support, **PS4 User's Guide via Custom DNS** is strongly recommended.

### Self-Hosted via Five Server & Cloudflare Tunnel

1.  Clone the repository to your local machine:
    
        git clone https://github.com/arg0WAK/WAK505-Core.git
        cd WAK505-Core
    
2.  Serve the directory using Five Server (default port: `65277`):
    
        npx five-server .
    
3.  Expose the local instance using Cloudflare Tunnel:
    
        cloudflared tunnel --url http://localhost:65277
    
4.  Open the generated `trycloudflare.com` URL in the PS4 browser.

### Direct Web or ESP Hosting

1.  Deploy the directory to any static HTTP web host, local server, or ESP8266/ESP32 board.
2.  Navigate to the hosted address using the PS4 browser.
3.  Allow the Application Cache (AppCache) to reach 100%.
4.  Once cached, close and reopen the browser; the exploit can now run entirely offline.

Credits
-------

*   **Core Bug:** [qwertyoruiopz](https://twitter.com/qwertyoruiopz)
*   **Exploit Chain:** [SpecterDev](https://github.com/Cryptogenic)
*   **FW Spoofer:** [Leeful](https://github.com/Leeful)
*   **GoldHEN:** [SiSTRo](https://github.com/SiSTR0)
*   **HEN:** [SiSTRo](https://github.com/Scene-Collective)
*   **Modular Architecture, Implementation & UI:** [arg0WAK](https://github.com/arg0WAK)