 // ---------- VIDEO PLAYER ----------
      (function () {
        const videoPlayer = document.getElementById("videoPlayer");
        const centerPlayBtn = document.getElementById("centerPlayBtn");
        const videoThumbnail = document.getElementById("videoThumbnail");
        const bottomControls = document.getElementById("bottomControls");
        const ctrlPlay = document.getElementById("ctrlPlay");
        const ctrlIcon = document.getElementById("ctrlIcon");
        const progressBar = document.getElementById("progressBar");
        const progressFilled = document.getElementById("progressFilled");
        const currentTimeEl = document.getElementById("currentTime");
        const durationEl = document.getElementById("duration");

        const muteBtn = document.getElementById("muteBtn");
        const muteIcon = document.getElementById("muteIcon");
        const volumeSlider = document.getElementById("volumeSlider");
        const volumeWrapper = document.getElementById("volumeWrapper");
        const volumeTrack = document.getElementById("volumeTrack");
        const volumeThumb = document.getElementById("volumeThumb");

        const btnFullscreen = document.getElementById("btnFullscreen");
        const fsIcon = document.getElementById("fsIcon");
        const videoWrap = document.getElementById("videoWrap");

        let controlsHideTimeout = null;
        let volumeHideTimeout = null;
        let lastVolume = 1;
        let volumeDragging = false;
        let pseudoFullscreen = false;

        function formatTime(seconds) {
          const mins = Math.floor(seconds / 60) || 0;
          const secs = Math.floor(seconds % 60) || 0;
          return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
        }

        videoPlayer.volume = 1;
        volumeSlider.value = 100;

        function startPlayback() {
          videoThumbnail.style.display = "none";
          videoPlayer.style.display = "block";
          showControls();
          videoPlayer.play().catch(() => {});
        }

        function showControls() {
          clearTimeout(controlsHideTimeout);
          bottomControls.classList.add("visible");
          bottomControls.setAttribute("aria-hidden", "false");
          controlsHideTimeout = setTimeout(() => {
            hideControls();
          }, 3000);
        }

        function hideControls() {
          if (volumeDragging) return;
          bottomControls.classList.remove("visible");
          bottomControls.setAttribute("aria-hidden", "true");
          volumeWrapper.classList.remove("active");
        }

        centerPlayBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          startPlayback();
        });

        ["pointermove", "mousemove", "touchstart", "click", "keydown"].forEach(
          (evt) =>
            videoWrap.addEventListener(
              evt,
              (e) => {
                showControls();
              },
              { passive: true }
            )
        );

        videoWrap.addEventListener("click", (e) => {
          if (
            bottomControls.contains(e.target) ||
            videoThumbnail.contains(e.target)
          )
            return;
          if (bottomControls.classList.contains("visible")) {
            hideControls();
          } else {
            showControls();
          }
        });

        ctrlPlay.addEventListener("click", (e) => {
          e.stopPropagation();
          if (videoPlayer.paused) {
            videoPlayer.play();
          } else {
            videoPlayer.pause();
          }
        });

        videoPlayer.addEventListener("play", () => {
          ctrlIcon.textContent = "pause";
        });
        videoPlayer.addEventListener("pause", () => {
          ctrlIcon.textContent = "play_arrow";
        });

        videoPlayer.addEventListener("loadedmetadata", () => {
          durationEl.textContent = formatTime(videoPlayer.duration || 0);
          const vol = videoPlayer.volume;
          volumeSlider.value = vol * 100;
          lastVolume = vol;
          updateVolumeThumbPosition();
          updateMuteIcon();
        });

        videoPlayer.addEventListener("timeupdate", () => {
          const cur = videoPlayer.currentTime || 0;
          const dur = videoPlayer.duration || 0;
          currentTimeEl.textContent = formatTime(cur);
          const pct = dur ? (cur / dur) * 100 : 0;
          progressFilled.style.width = pct + "%";
        });

        progressBar.addEventListener("click", (ev) => {
          const rect = progressBar.getBoundingClientRect();
          const pct = Math.max(
            0,
            Math.min(1, (ev.clientX - rect.left) / rect.width)
          );
          const dur = videoPlayer.duration || 0;
          videoPlayer.currentTime = dur * pct;
        });

        let dragging = false;
        progressBar.addEventListener("pointerdown", (ev) => {
          dragging = true;
          progressBar.setPointerCapture(ev.pointerId);
        });
        progressBar.addEventListener("pointermove", (ev) => {
          if (!dragging) return;
          const rect = progressBar.getBoundingClientRect();
          const pct = Math.max(
            0,
            Math.min(1, (ev.clientX - rect.left) / rect.width)
          );
          progressFilled.style.width = pct * 100 + "%";
          currentTimeEl.textContent = formatTime(
            (videoPlayer.duration || 0) * pct
          );
        });
        progressBar.addEventListener("pointerup", (ev) => {
          if (!dragging) return;
          dragging = false;
          const rect = progressBar.getBoundingClientRect();
          const pct = Math.max(
            0,
            Math.min(1, (ev.clientX - rect.left) / rect.width)
          );
          videoPlayer.currentTime = (videoPlayer.duration || 0) * pct;
          progressBar.releasePointerCapture(ev.pointerId);
        });

        videoThumbnail.addEventListener("click", () => startPlayback());

        function updateMuteIcon() {
          if (videoPlayer.volume === 0) {
            muteIcon.textContent = "volume_mute";
          } else if (videoPlayer.volume < 0.5) {
            muteIcon.textContent = "volume_down";
          } else {
            muteIcon.textContent = "volume_up";
          }
          volumeThumb.setAttribute(
            "aria-valuenow",
            Math.round(videoPlayer.volume * 100)
          );
        }

        function updateVolumeThumbPosition() {
          const vol = parseFloat(volumeSlider.value) / 100;
          const trackHeight = volumeTrack.offsetHeight || 50;
          const topPos = trackHeight * (1 - vol);
          volumeThumb.style.top = topPos + "px";
          volumeThumb.setAttribute("aria-valuenow", Math.round(vol * 100));
        }

        function scheduleVolumeHide() {
          clearTimeout(volumeHideTimeout);
          volumeHideTimeout = setTimeout(() => {
            volumeWrapper.classList.remove("active");
            scheduleControlsHide();
          }, 1200);
        }

        function scheduleControlsHide() {
          clearTimeout(controlsHideTimeout);
          controlsHideTimeout = setTimeout(() => {
            hideControls();
          }, 1800);
        }

        muteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (videoPlayer.volume === 0) {
            const restore = lastVolume > 0 ? lastVolume : 0.5;
            videoPlayer.volume = restore;
            volumeSlider.value = restore * 100;
          } else {
            lastVolume = videoPlayer.volume;
            videoPlayer.volume = 0;
            volumeSlider.value = 0;
          }
          updateVolumeThumbPosition();
          updateMuteIcon();
          showControls();
        });

        muteBtn.addEventListener("mouseenter", () => {
          clearTimeout(volumeHideTimeout);
          volumeWrapper.classList.add("active");
          showControls();
        });
        muteBtn.addEventListener("mouseleave", () => {
          if (!volumeDragging) scheduleVolumeHide();
        });
        muteBtn.addEventListener(
          "touchstart",
          (e) => {
            e.stopPropagation();
            clearTimeout(volumeHideTimeout);
            volumeWrapper.classList.add("active");
            showControls();
          },
          { passive: true }
        );
        document.addEventListener("touchend", () => {
          if (!volumeDragging) scheduleVolumeHide();
        });

        volumeWrapper.addEventListener("mouseenter", () => {
          clearTimeout(volumeHideTimeout);
          showControls();
        });
        volumeWrapper.addEventListener("mouseleave", () => {
          if (!volumeDragging) scheduleVolumeHide();
        });

        volumeThumb.addEventListener("pointerdown", (ev) => {
          ev.stopPropagation();
          volumeDragging = true;
          clearTimeout(volumeHideTimeout);
          volumeThumb.setPointerCapture(ev.pointerId);
          showControls();
        });

        document.addEventListener(
          "pointermove",
          (ev) => {
            if (!volumeDragging) return;
            const trackRect = volumeTrack.getBoundingClientRect();
            const y = ev.clientY - trackRect.top;
            const trackHeight = trackRect.height;
            const constrainedY = Math.max(0, Math.min(trackHeight, y));
            const vol = Math.max(
              0,
              Math.min(1, (trackHeight - constrainedY) / trackHeight)
            );
            videoPlayer.volume = vol;
            volumeSlider.value = vol * 100;
            const topPos = trackHeight * (1 - vol);
            volumeThumb.style.top = topPos + "px";
            if (vol > 0) lastVolume = vol;
            updateMuteIcon();
            showControls();
          },
          { passive: true }
        );

        document.addEventListener("pointerup", (ev) => {
          if (!volumeDragging) return;
          volumeDragging = false;
          volumeThumb.releasePointerCapture(ev.pointerId);
          scheduleVolumeHide();
        });

        volumeTrack.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const trackRect = volumeTrack.getBoundingClientRect();
          const y = ev.clientY - trackRect.top;
          const trackHeight = trackRect.height;
          const constrainedY = Math.max(0, Math.min(trackHeight, y));
          const vol = Math.max(
            0,
            Math.min(1, (trackHeight - constrainedY) / trackHeight)
          );
          videoPlayer.volume = vol;
          volumeSlider.value = vol * 100;
          const topPos = trackHeight * (1 - vol);
          volumeThumb.style.top = topPos + "px";
          if (vol > 0) lastVolume = vol;
          updateMuteIcon();
          showControls();
          scheduleVolumeHide();
        });

        volumeSlider.addEventListener("input", (e) => {
          const v = parseFloat(e.target.value) / 100;
          videoPlayer.volume = v;
          if (v > 0) lastVolume = v;
          updateVolumeThumbPosition();
          updateMuteIcon();
        });

        function isFullscreen() {
          return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
          );
        }

        async function enterFullscreen(el) {
          try {
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen)
              await el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
            else if (el.msRequestFullscreen) await el.msRequestFullscreen();
            pseudoFullscreen = false;
            applyFullscreenStyles(true);
            return;
          } catch (err) {}
          videoWrap.classList.add("fs-fallback");
          pseudoFullscreen = true;
          applyFullscreenStyles(true);
        }

        async function exitFullscreen() {
          try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen)
              await document.webkitExitFullscreen();
            else if (document.mozCancelFullScreen)
              await document.mozCancelFullScreen();
            else if (document.msExitFullscreen)
              await document.msExitFullscreen();
            pseudoFullscreen = false;
            applyFullscreenStyles(false);
            return;
          } catch (err) {}
          videoWrap.classList.remove("fs-fallback");
          pseudoFullscreen = false;
          applyFullscreenStyles(false);
        }

        function applyFullscreenStyles(enter) {
          if (enter) {
            videoPlayer.classList.remove("object-cover");
            videoPlayer.classList.add("object-contain");
            fsIcon.textContent = "fullscreen_exit";
            showControls();
          } else {
            videoPlayer.classList.remove("object-contain");
            videoPlayer.classList.add("object-cover");
            fsIcon.textContent = "fullscreen";
            showControls();
            scheduleControlsHide();
          }
        }

        btnFullscreen.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (isFullscreen() || pseudoFullscreen) {
            await exitFullscreen();
          } else {
            await enterFullscreen(videoWrap || document.documentElement);
          }
        });

        [
          "fullscreenchange",
          "webkitfullscreenchange",
          "mozfullscreenchange",
          "MSFullscreenChange",
        ].forEach((ev) =>
          document.addEventListener(ev, () => {
            const inFs = isFullscreen();
            applyFullscreenStyles(inFs);
          })
        );

        videoPlayer.addEventListener("play", () => {
          showControls();
          scheduleControlsHide();
        });

        videoPlayer.addEventListener("ended", () => {
          videoPlayer.style.display = "none";
          videoThumbnail.style.display = "flex";
          bottomControls.classList.remove("visible");
          bottomControls.setAttribute("aria-hidden", "true");
          videoPlayer.currentTime = 0;
        });

        videoWrap.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            if (videoPlayer.paused) videoPlayer.play();
            else videoPlayer.pause();
          } else if (e.key.toLowerCase() === "f") {
            btnFullscreen.click();
          } else if (e.key.toLowerCase() === "m") {
            muteBtn.click();
          }
          showControls();
        });

        window.addEventListener("load", () => {
          updateVolumeThumbPosition();
          updateMuteIcon();
        });
      })();