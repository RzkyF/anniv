  // Video player functionality
    const playBtn = document.getElementById('playBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoThumbnail = document.getElementById('videoThumbnail');

    playBtn.addEventListener('click', () => {
      videoThumbnail.classList.add('hidden');
      videoPlayer.classList.remove('hidden');
      videoPlayer.play();
    });

    videoPlayer.addEventListener('ended', () => {
      videoPlayer.classList.add('hidden');
      videoThumbnail.classList.remove('hidden');
    });