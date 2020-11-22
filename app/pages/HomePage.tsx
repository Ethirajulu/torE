import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InputForm from '../components/InputForm';
import Torrent from '../components/Torrent';
import { startTorrent } from '../webtorrent';

import styles from '../styles/Home.css';
import { selectTorrents } from '../redux/torrentSlice';

const HomePage: FC = () => {
  const dispatch = useDispatch();
  const torrents = useSelector(selectTorrents);
  const onSubmit = (uri: string) => {
    startTorrent(uri, dispatch);
  };

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>
        <span style={{ color: 'red' }}>e</span> TOR
      </h1>
      <InputForm onSubmit={onSubmit} />
      <div className={styles.torrents_grid}>
        {torrents.map((torrent) => (
          <Torrent key={torrent.key} torrentLiteMeta={torrent} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
