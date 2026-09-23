// helper.js - Strict Safe WebKit/601.2+ Version
function safeSetLocalStorage(key, value) {
    try {
        if (window.localStorage) {
            localStorage.setItem(key, value);
            return true;
        }
    } catch (e) {
    }
    return false;
}

function safeGetLocalStorage(key) {
    try {
        if (window.localStorage) {
            return localStorage.getItem(key);
        }
    } catch (e) { }
    return null;
}

function safeRemoveLocalStorage(key) {
    try {
        if (window.localStorage) {
            localStorage.removeItem(key);
        }
    } catch (e) { }
}

function safeGetSessionStorage(key) {
    try {
        if (window.sessionStorage) {
            return sessionStorage.getItem(key);
        }
    } catch (e) { }
    return null;
}

window.onerror = function (message, source, lineno) {
    var fileName = source ? source.substring(source.lastIndexOf('/') + 1) : 'inline';
    setTemporaryStatus('<span style="color: #ef4444;">Error [' + fileName + ':' + lineno + ']: ' + message + '</span>');
};

var defaultStatus = "Waiting for command...";

function isEnabledHomebrew(type) {
    if (type != null) {
        safeSetLocalStorage('enabledHomebrew', type);
    }
    return safeGetLocalStorage('enabledHomebrew');
}

function setStatus(text) {
    var statusElement = document.getElementById("status");
    if (statusElement) {
        statusElement.innerHTML = text;
    }
}

function w_desc(text) {
    setStatus(text);
}

function e_desc() {
    setStatus(defaultStatus);
}

function setTemporaryStatus(text, delay) {
    setStatus(text);
    setTimeout(function () {
        e_desc();
    }, delay || 3000);
}

function initializeAppCache() {
    try {
        if (!window.applicationCache) return;

        window.applicationCache.onprogress = function (event) {
            var progressPercentage = Math.round(100 * (event.loaded / event.total));
            setStatus("Installing Offline Cache: " + progressPercentage + "%");
        };

        window.applicationCache.oncached = function () {
            setTimeout(function () {
                setStatus("Cache Installed Successfully ✔");
            }, 1500);

            safeSetLocalStorage('cached', 'yes');

            setTimeout(function () {
                setStatus("Refreshing the page to apply updates...");
            }, 3000);

            setTimeout(function () {
                location.reload();
            }, 4500);
        };

        window.applicationCache.onnoupdate = function () {
            safeSetLocalStorage('cached', 'yes');
        };

        window.applicationCache.onerror = function () {
            safeSetLocalStorage('cached', 'yes');
        };
    } catch (err) {

    }
}

function startExploitChain() {
    setStatus("Starting the exploit chain. Please wait...");

    if (typeof exploit === "function") {
        setTimeout(function () {
            try {
                exploit();
            } catch (err) {
                setStatus('<span style="color: #ef4444;">Exploitation Error: ' + (err.message || err) + '</span>');
            }
        }, 50);
    } else {
        setStatus('<span style="color: #ef4444;">Exploit function not found. Modules failed to load.</span>');
    }
}

function exploitSuccess() {
    setStatus("Exploit Successful. Preparing UI...");
    setTimeout(function () {
        triggerControls();
    }, 1500);
}

function triggerControls() {
    var uiControlsElement = document.getElementById("controls");
    setStatus("Checking AutoLoad preference...");

    var autoLoadTriggered = checkAutoLoadPreference();

    if (uiControlsElement) {
        uiControlsElement.style.display = "block";
    }

    if (!autoLoadTriggered) {
        e_desc();
    }
}

function toggleAutoLoad(isChecked) {
    if (isChecked) {
        safeSetLocalStorage('autoload', 'yes');
        setTemporaryStatus('<span style="color: #22c55e;">AutoLoad enabled.</span>', 3000);
    } else {
        safeRemoveLocalStorage('autoload');
        setTemporaryStatus('<span style="color: #ef4444;">Autoload disabled.</span>', 3000);
    }
}

function checkAutoLoadPreference() {
    var autoloadCheckbox = document.getElementById("autoload");
    var isAutoLoading = false;

    var homebrew = (typeof isEnabledHomebrew === "function") ? isEnabledHomebrew() : null;

    if (homebrew !== null && safeGetLocalStorage('autoload') === 'yes') {
        if (autoloadCheckbox) autoloadCheckbox.checked = true;

        if (safeGetSessionStorage('kernelPatched') === 'yes') {
            var functionName = "i_" + homebrew;

            if (typeof window[functionName] === "function") {
                setTimeout(function () {
                    try {
                        window[functionName]();
                    } catch (invokeErr) {
                        setTemporaryStatus('<span style="color: #ef4444;">AutoLoad Function Error: ' + (invokeErr.message || invokeErr) + '</span>', 3000);
                    }
                }, 1000);

                isAutoLoading = true;
            }
        }
    }

    return isAutoLoading;
}

function injectPL(payloadUrl) {
    var req = new XMLHttpRequest();
    req.responseType = "arraybuffer";

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            try {
                var code_addr = new int64(0x26100000, 0x00000009);
                var mapped_address = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

                if (mapped_address.toString() !== '926100000') {
                    throw "sys_mmap failed";
                }

                var padding = new Uint8Array(4 - (req.response.byteLength % 4) % 4);
                var tmp = new Uint8Array(req.response.byteLength + padding.byteLength);
                tmp.set(new Uint8Array(req.response), 0);
                tmp.set(padding, req.response.byteLength);

                var shellcode = new Uint32Array(tmp.buffer);
                for (var i = 0; i < shellcode.length; i++) {
                    p.write4(code_addr.add32(0x100000 + i * 4), shellcode[i]);
                }

                p.fcall(code_addr);
                p.syscall("sys_munmap", code_addr, 0x300000);

                setTemporaryStatus('<span style="color: #22c55e;">Payload Injected Successfully!</span>', 3000);
            } catch (e) {
                setTemporaryStatus('<span style="color: #ef4444;">Payload Error: ' + (e.message || e) + '</span>', 4000);
            }
        }
    };
    req.open('GET', payloadUrl);
    req.send();
}

function triggerBinLoader() {
    var code_addr = new int64(0x26100000, 0x00000009);
    var mapped_address = p.syscall("sys_mmap", code_addr, 0x300000, 7, 0x41000, -1, 0);

    if (mapped_address.toString() === '926100000') {
        try {
            var shcode = [
                0x31fe8948, 0x3d8b48c0, 0x00003ff4, 0xed0d8b48, 0x4800003f, 0xaaf3f929, 0xe8f78948, 0x00000060,
                0x48c3c031, 0x0003c0c7, 0x89490000, 0xc3050fca, 0x06c0c748, 0x49000000, 0x050fca89, 0xc0c748c3,
                0x0000001e, 0x0fca8949, 0xc748c305, 0x000061c0, 0xca894900, 0x48c3050f, 0x0068c0c7, 0x89490000,
                0xc3050fca, 0x6ac0c748, 0x49000000, 0x050fca89, 0x909090c3, 0x90909090, 0x90909090, 0x90909090,
                0xb8555441, 0x00003c23, 0xbed23153, 0x00000001, 0x000002bf, 0xec834800, 0x2404c610, 0x2444c610,
                0x44c70201, 0x00000424, 0x89660000, 0xc6022444, 0x00082444, 0x092444c6, 0x2444c600, 0x44c6000a,
                0xc6000b24, 0x000c2444, 0x0d2444c6, 0xff78e800, 0x10baffff, 0x41000000, 0x8948c489, 0xe8c789e6,
                0xffffff73, 0x00000abe, 0xe7894400, 0xffff73e8, 0x31d231ff, 0xe78944f6, 0xffff40e8, 0x48c589ff,
                0x200000b8, 0x00000926, 0xc300c600, 0xebc38948, 0x801f0f0c, 0x00000000, 0x01489848, 0x1000bac3,
                0x89480000, 0xe8ef89de, 0xfffffef7, 0xe87fc085, 0xe8e78944, 0xfffffef8, 0xf1e8ef89, 0x48fffffe,
                0x200000b8, 0x00000926, 0x48d0ff00, 0x5b10c483, 0xc35c415d, 0xc3c3c3c3
            ];
            var shellbuf = p.malloc32(0x1000);
            for (var i = 0; i < shcode.length; i++) {
                shellbuf.backing[i] = shcode[i];
            }

            p.syscall("sys_mprotect", shellbuf, 0x4000, 7);
            var thread_id_ptr = p.malloc(0x08);

            p.fcall(window.gadgets["scePthreadCreate"], thread_id_ptr, 0, shellbuf, 0, p.stringify("loader"));
        } catch (e) {
            setTemporaryStatus('<span style="color: #ef4444;">Binloader Error: ' + (e.message || e) + '</span>', 4000);
        }
    }
}

function i_goldhen() {
    setTemporaryStatus("Loading GoldHEN v2.4b18.11...");
    injectPL("binaries/goldhen.bin");
    isEnabledHomebrew("goldhen");
}

function i_hen() {
    setTemporaryStatus("Loading HEN v2.2.0pl182...");
    injectPL("binaries/hen.bin");
    isEnabledHomebrew("hen");
}

function i_app2usb() {
    setTemporaryStatus("Loading App2USB...");
    injectPL("binaries/app2usb.bin");
}

function i_backup() {
    setTemporaryStatus("Loading Backup...");
    injectPL("binaries/backup.bin");
}

function i_restore() {
    setTemporaryStatus("Loading Restore...");
    injectPL("binaries/restore.bin");
}

function i_disableUpdates() {
    setTemporaryStatus("Loading Disable Updates...");
    injectPL("binaries/disable-updates.bin");
}

function i_enableUpdates() {
    setTemporaryStatus("Loading Enable Updates...");
    injectPL("binaries/enable-updates.bin");
}

function i_rifRenamer() {
    setTemporaryStatus("Loading RIF Renamer...");
    injectPL("binaries/rif-renamer.bin");
}

function i_kernelClock() {
    setTemporaryStatus("Loading Kernel Clock...");
    injectPL("binaries/Kernel-Clock.bin");
}

function i_pupDecrypt() {
    setTemporaryStatus("Loading PUP Decrypt...");
    injectPL("binaries/pup-decrypt.bin");
}

function i_historyBlocker() {
    setTemporaryStatus("Loading History Blocker...");
    injectPL("binaries/history-blocker.bin");
}

function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}

function applyFirmware() {
    var num = document.getElementById("numbz");
    var FWval;

    if (num.value.indexOf(".") == "-1" && num.value.length == "5") {
        setTemporaryStatus('<span style="color: #ef4444;">Invalid firmware version entered. Try again!</span>', 3000);
        return;
    }

    if (num.value.indexOf(".") == "-1" && num.value.length < "3") {
        FWval = "0x0" + num.value.replace('.', '') + "0000";
    } else if (num.value.indexOf(".") == "1" && num.value.length < "4") {
        FWval = "0x0" + num.value.replace('.', '') + "000";
    } else if (num.value.indexOf(".") == "2" && num.value.length < "5") {
        FWval = "0x" + num.value.replace('.', '') + "000";
    } else {
        FWval = "0x0" + num.value.replace('.', '') + "00";
    }

    executeSpoof(FWval, num.value);
}

function executeSpoof(FWval, displayFw) {
    setStatus("Spoofing firmware to v" + displayFw + "...");

    try {
        var code_addr = new int64(0x26100000, 0x00000009);
        var mapped_address = p.syscall(477, code_addr, 0x300000, 7, 0x41000, -1, 0);

        if (mapped_address.toString() === '926100000') {
            writePL(p.write4, code_addr.add32(0x100000), FWval);
            p.fcall(code_addr);
            p.syscall(73, code_addr, 0x300000);

            setTemporaryStatus('<span style="color: #22c55e;">Firmware version successfully spoofed to: v' + displayFw + '</span>', 4000);

            var spoofedFwSpan = document.getElementById("spoofed-fw");
            if (spoofedFwSpan) {
                spoofedFwSpan.innerHTML = "v" + displayFw;
            }
        } else {
            throw new Error("Memory mapping failed.");
        }
    } catch (e) {
        setStatus('<span style="color: #ef4444;">Spoofer Error: ' + (e.message || e) + '</span>');
    }
}

window.addEventListener('load', function () {
    initializeAppCache();

    if (safeGetLocalStorage('cached') === 'yes') {
        startExploitChain();
    }
});