/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import WebTorrent from 'webtorrent';
import crypto from 'crypto';
import uuid4 from 'uuid4';
import { addTorrent } from './redux/torrentSlice';
import config from './constants/config';

// magnet:?xt=urn:btih:40DE2D19AF7221BF27DB338C693A26E35913CCC0&dn=Naruto%20(2002)%20Complete%20Series%20720p%20HEVC%20x265%20%7BGPR%7D%20Download&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2850%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce
// magnet:?xt=urn:btih:264DDC5905ECABBBB7D66743EDD36ED9E01E9D01&dn=Star%20Trek%20Movie%20Collection%201979-2016%20720p%20BluRay%20x264%20AC3-RPG&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2850%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce
const defaultAnnounceList = require('create-torrent').announceList;

global.WEBTORRENT_ANNOUNCE = defaultAnnounceList
  .map((arr) => arr[0])
  .filter((url) => url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0);

const VERSION = require('../package.json').version;

const VERSION_STR = VERSION.replace(/\d*./g, (v) =>
  `0${v % 100}`.slice(-2)
).slice(0, 4);

const VERSION_PREFIX = `-WD${VERSION_STR}-`;

const PEER_ID = Buffer.from(
  VERSION_PREFIX + crypto.randomBytes(9).toString('base64')
);

const client = new WebTorrent({ peerId: PEER_ID });

window.client = client;

export const getTorrent = (torrentKey) => {
  const torrent = client.torrents.find((t) => t.key === torrentKey);
  return torrent;
};

export const startTorrent = (uri, dispatch) => {
  const torrent = client.add(uri, {
    path: config.DOWNLOAD_PATH,
  });
  torrent.key = uuid4();
  dispatch(addTorrent(torrent.key));
};

export const stopTorrent = (infoHash) => {
  const torrent = client.get(infoHash);
  if (torrent) torrent.destroy();
};
