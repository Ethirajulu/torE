/* eslint-disable no-console */
import WebTorrent from 'webtorrent';
import config from '../constants/config';
import { TorrentType } from '../redux/torrentSlice';
import torrentPoster from './torrent-poster';

const fs = require('fs');
const path = require('path');

const getTorrentFileInfo = (file: WebTorrent.TorrentFile) => {
  return {
    name: file.name,
    length: file.length,
    path: file.path,
  };
};

// eslint-disable-next-line import/prefer-default-export
export const getTorrentInfo = (torrent: TorrentType) => {
  return {
    infoHash: torrent.infoHash,
    magnetURI: torrent.magnetURI,
    name: torrent.name,
    path: torrent.path,
    files: torrent.files?.map(getTorrentFileInfo),
    bytesReceived: torrent.received,
  };
};

export const generateTorrentPoster = (
  torrent: WebTorrent.Torrent,
  setupPoster: (posterFileName: string) => void
) => {
  torrentPoster(torrent, (err: string, buf: unknown, extension: string) => {
    if (err) {
      console.error(
        `Error generating poster for torrent ${torrent.name}: ${err}`
      );
    } else {
      // save it for next time
      fs.mkdir(config.POSTER_PATH, { recursive: true }, (fsMkErr: string) => {
        if (fsMkErr) {
          console.error(
            `Error creating poster for torrent ${torrent.name}: ${fsMkErr}`
          );
        } else {
          const posterFileName = torrent.infoHash + extension;
          console.log('posterFileName: ', posterFileName);
          const posterFilePath = path.join(config.POSTER_PATH, posterFileName);
          fs.writeFile(posterFilePath, buf, (fsWrErr: string) => {
            if (fsWrErr) {
              console.error(
                `Error saving poster for torrent ${torrent.name}: ${fsWrErr}`
              );
            } else {
              setupPoster(posterFileName);
            }
          });
        }
      });
    }
  });
};

export const prettyBytes = (num: number) => {
  let inNum = num;
  const neg = inNum < 0;
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (neg) inNum = -inNum;
  if (inNum < 1) return `${(neg ? '-' : '') + inNum} B`;
  const exponent = Math.min(
    Math.floor(Math.log(inNum) / Math.log(1000)),
    units.length - 1
  );
  inNum = Number((inNum / 1000 ** exponent).toFixed(2));
  const unit = units[exponent];
  return `${(neg ? '-' : '') + inNum} ${unit}`;
};
