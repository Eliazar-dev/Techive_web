Put hero videos here (or host them on your media service and set VITE_MEDIA_URL):

  aerial-city.mp4        slide 1  - aerial view of city / buildings
  developers-coding.mp4  slide 2  - people coding
  payments.mp4           slide 3
  analytics.mp4          slide 4

Specs for speed: MP4 (H.264), 1280x720, 8-15 seconds, no audio, under 3 MB each, loopable.
Compress:  ffmpeg -i in.mp4 -vf scale=1280:-2 -an -c:v libx264 -crf 28 -preset slow -movflags +faststart out.mp4
Edit slide text/order in src/data.js  (export const slides).
If a video is missing the hero falls back to a dark gradient.
