 // Video player
    const playBtn = document.getElementById('playBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      videoThumbnail.style.display = 'none';
      videoPlayer.style.display = 'block';
      videoPlayer.play();
    });

    videoPlayer.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(videoPlayer.duration);
    });

    videoPlayer.addEventListener('timeupdate', () => {
      currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
    });

    videoPlayer.addEventListener('ended', () => {
      videoPlayer.style.display = 'none';
      videoThumbnail.style.display = 'flex';
      videoPlayer.currentTime = 0;
    });

    videoThumbnail.addEventListener('click', (e) => {
      if (e.target === playBtn || playBtn.contains(e.target)) {
        playBtn.click();
      }
    });