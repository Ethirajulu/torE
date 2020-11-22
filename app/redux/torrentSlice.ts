/* eslint-disable no-param-reassign */
import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import WebTorrent from 'webtorrent';
// eslint-disable-next-line import/no-cycle
import { RootState } from './store';

export type TorrentType = WebTorrent.Torrent & {
  key: string;
};

export type PosterType = { [key: string]: string };

export type TorrentItem = {
  key: string;
  posterName: string | null;
};

export const setPoster = createAction<TorrentItem>('setPoster');

const torrentSlice = createSlice({
  name: 'torrent',
  initialState: [] as TorrentItem[],
  reducers: {
    addTorrent: {
      reducer: (state, action: PayloadAction<TorrentItem>) => {
        state.push(action.payload);
      },
      prepare: (torrentKey: string) => {
        return { payload: { key: torrentKey, posterName: null } };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setPoster, (state, action) => {
        const filteredState = state.filter(
          (torrent) => torrent.key !== action.payload.key
        );
        return [...filteredState, action.payload];
      })
      .addDefaultCase(() => {});
  },
});

export const { addTorrent } = torrentSlice.actions;

export default torrentSlice.reducer;

export const selectTorrents = createSelector(
  (state: RootState) => state.torrents,
  (torrents) => torrents
);
