/* eslint-disable no-console */
import { Card, Descriptions, Progress } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import WebTorrent from 'webtorrent';
import { TorrentItem, setPoster } from '../redux/torrentSlice';
import { generateTorrentPoster, prettyBytes } from '../utils';
import { getTorrent, stopTorrent } from '../webtorrent';

import styles from '../styles/Home.css';
import config from '../constants/config';

type PropTypes = {
  torrentLiteMeta: TorrentItem;
};

type TorrentInfoType = {
  peers: number;
  downloaded: string;
  total: string;
  remaining: string;
  downloadSpeed: string;
  uploadSpeed: string;
  percent: number;
};

const initialValues: TorrentInfoType = {
  peers: 0,
  downloaded: '0',
  total: '0',
  remaining: '0',
  downloadSpeed: '0',
  uploadSpeed: '0',
  percent: 0,
};

const { Meta } = Card;

const Torrent: FC<PropTypes> = ({ torrentLiteMeta }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState<string>('');
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfoType>(
    initialValues
  );
  const [status, setStatus] = useState<
    'success' | 'normal' | 'exception' | 'active' | undefined
  >(undefined);

  const onProgress = (torrent: WebTorrent.Torrent) => {
    let remaining = 'Done';
    if (!torrent.done) {
      remaining = moment
        .duration(torrent.timeRemaining / 1000, 'seconds')
        .humanize();
      remaining = `${remaining[0].toUpperCase()}${remaining.substring(1)}`;
    }
    const newTorrentInfo: TorrentInfoType = {
      peers: torrent.numPeers,
      downloadSpeed: prettyBytes(torrent.downloadSpeed),
      downloaded: prettyBytes(torrent.downloaded),
      percent: Math.round(torrent.progress * 100 * 100) / 100,
      total: prettyBytes(torrent.length),
      uploadSpeed: prettyBytes(torrent.uploadSpeed),
      remaining,
    };
    setTorrentInfo(newTorrentInfo);
  };

  useEffect(() => {
    const setupPoster = (posterName: string) => {
      dispatch(setPoster({ key: torrentLiteMeta.key, posterName }));
    };
    const addTorrentEvents = (torrent: WebTorrent.Torrent) => {
      torrent.on('warning', (err) =>
        console.warn(`Warning for torrent ${torrent.name}: ${err}`)
      );
      torrent.on('error', (err) => {
        console.warn(`Error for torrent ${torrent.name}: ${err}`);
        if (torrent.infoHash) {
          stopTorrent(torrent.infoHash);
        }
      });
      torrent.on('infoHash', () => {
        setStatus('active');
        console.info(`Got info-hash for torrent ${torrent.name}`);
      });
      torrent.on('metadata', () => {
        generateTorrentPoster(torrent, setupPoster);
        setName(torrent.name);
        setInterval(() => onProgress(torrent), 500);
      });
    };
    const torrent = getTorrent(torrentLiteMeta.key);
    if (torrent) {
      addTorrentEvents(torrent);
    }
  }, [dispatch, torrentLiteMeta.key]);

  return (
    // <div className={styles.torrent}>
    <Card
      cover={
        <img
          alt="torrent"
          src={`${config.POSTER_PATH}${
            torrentLiteMeta.posterName
              ? torrentLiteMeta.posterName
              : 'dummy.png'
          }`}
        />
      }
      className={styles.torrent}
    >
      <Meta
        title={name}
        description={
          <>
            <Descriptions
              title="Torrent Info"
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Peers">{`${torrentInfo.peers} ${
                torrentInfo.peers === 1 ? 'peer' : 'peers'
              }`}</Descriptions.Item>
              <Descriptions.Item label="Downloaded">
                {torrentInfo.downloaded}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                {torrentInfo.total}
              </Descriptions.Item>
              <Descriptions.Item label="Remaining">
                {torrentInfo.remaining}
              </Descriptions.Item>
              <Descriptions.Item label="Download Speed">
                {torrentInfo.downloadSpeed}
              </Descriptions.Item>
              <Descriptions.Item label="Upload Speed">
                {torrentInfo.uploadSpeed}
              </Descriptions.Item>
            </Descriptions>
            <div className={styles.progress}>
              <Progress percent={torrentInfo.percent} status={status} />
            </div>
          </>
        }
      />
    </Card>
    // </div>
  );
};

export default Torrent;
