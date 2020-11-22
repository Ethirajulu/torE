import mediaExtensions from './media-extensions';

const captureFrame = require('capture-frame');
const path = require('path');

const msgNoSuitablePoster =
  'Cannot generate a poster from any files in the torrent';

/**
 * Filter file on a list extension, can be used to find al image files
 * @param torrent Torrent to filter files from
 * @param extensions File extensions to filter on
 * @returns {Array} Array of torrent file objects matching one of the given extensions
 */
const filterOnExtension = (torrent, extensions) => {
  return torrent.files.filter((file) => {
    const extname = path.extname(file.name).toLowerCase();
    return extensions.indexOf(extname) !== -1;
  });
};

/**
 * Calculate the total data size of file matching one of the provided extensions
 * @param torrent
 * @param extensions List of extension to match
 * @returns {number} total size, of matches found (>= 0)
 */
function calculateDataLengthByExtension(torrent, extensions) {
  const files = filterOnExtension(torrent, extensions);
  if (files.length === 0) return 0;
  return files
    .map((file) => file.length)
    .reduce((a, b) => {
      return a + b;
    });
}

/**
 * Get the largest file of a given torrent, filtered by provided extension
 * @param torrent Torrent to search in
 * @param extensions Extension whitelist filter
 * @returns Torrent file object
 */
const getLargestFileByExtension = (torrent, extensions) => {
  const files = filterOnExtension(torrent, extensions);
  if (files.length === 0) return undefined;
  return files.reduce((a, b) => {
    return a.length > b.length ? a : b;
  });
};

/**
 * Returns a score how likely the file is suitable as a poster
 * @param imgFile File object of an image
 * @returns {number} Score, higher score is a better match
 */
const scoreAudioCoverFile = (imgFile) => {
  const fileName = path
    .basename(imgFile.name, path.extname(imgFile.name))
    .toLowerCase();
  const relevanceScore = {
    cover: 80,
    folder: 80,
    album: 80,
    front: 80,
    back: 20,
    spectrogram: -80,
  };

  let score = 0;
  Object.keys(relevanceScore).forEach((keyword) => {
    if (fileName === keyword) {
      score = relevanceScore[keyword];
    }
    if (fileName.indexOf(keyword) !== -1) {
      score = relevanceScore[keyword];
    }
  });
  return score;
};

const torrentPosterFromAudio = (torrent, cb) => {
  const imageFiles = filterOnExtension(torrent, mediaExtensions.image);

  if (imageFiles.length === 0) {
    cb(new Error(msgNoSuitablePoster));
  }

  const bestCover = imageFiles
    .map((file) => {
      return {
        file,
        score: scoreAudioCoverFile(file),
      };
    })
    .reduce((a, b) => {
      if (a.score > b.score) {
        return a;
      }
      if (b.score > a.score) {
        return b;
      }
      // If score is equal, pick the largest file, aiming for highest resolution
      if (a.file.length > b.file.length) {
        return a;
      }
      return b;
    });

  const extname = path.extname(bestCover.file.name);
  bestCover.file.getBuffer((err, buf) => cb(err, buf, extname));
};

function torrentPosterFromVideo(torrent, cb) {
  const file = getLargestFileByExtension(torrent, mediaExtensions.video);
  const index = torrent.files.indexOf(file);
  const video = document.createElement('video');
  const server = torrent.createServer(0);

  const onListening = () => {
    const { port } = server.address();
    const url = `http://localhost:${port}/${index}`;
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      const frame = captureFrame(video);
      const buf = frame && frame.image;
      // unload video element
      video.pause();
      video.src = '';
      video.load();
      server.destroy();
      if (buf.length === 0) {
        cb(new Error(msgNoSuitablePoster));
      }
      cb(null, buf, '.jpg');
    };

    const onCanPlay = () => {
      video.removeEventListener('canplay', onCanPlay);
      video.addEventListener('seeked', onSeeked);
      video.currentTime = Math.min((video.duration || 600) * 0.03, 60);
    };

    video.addEventListener('canplay', onCanPlay);
    video.volume = 0;
    video.src = url;
    video.play();
  };
  server.listen(0, onListening);
}

const extractPoster = (file, cb) => {
  const extname = path.extname(file.name);
  file.getBuffer((err, buf) => {
    return cb(err, buf, extname);
  });
};

const torrentPosterFromImage = (torrent, cb) => {
  const file = getLargestFileByExtension(torrent, mediaExtensions.image);
  extractPoster(file, cb);
};

const torrentPoster = (torrent, cb) => {
  // First, try to use a poster image if available
  const posterFile = torrent.files.filter((file) => {
    return /^poster\.(jpg|png|gif)$/.test(file.name);
  })[0];
  if (posterFile) {
    extractPoster(posterFile, cb);
  }

  // 'score' each media type based on total size present in torrent
  const bestScore = ['audio', 'video', 'image']
    .map((mediaType) => {
      return {
        type: mediaType,
        size: calculateDataLengthByExtension(
          torrent,
          mediaExtensions[mediaType]
        ),
      };
    })
    .sort((a, b) => {
      // sort descending on size
      return b.size - a.size;
    })[0];

  if (bestScore.size === 0) {
    // Admit defeat, no video, audio or image had a significant presence
    cb(new Error(msgNoSuitablePoster));
  }

  // Based on which media type is dominant we select the corresponding poster function
  switch (bestScore.type) {
    case 'audio':
      torrentPosterFromAudio(torrent, cb);
      break;
    case 'image':
      torrentPosterFromImage(torrent, cb);
      break;
    case 'video':
      torrentPosterFromVideo(torrent, cb);
      break;
    default:
  }
};

export default torrentPoster;
