import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import torrentReducer from './torrentSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    torrents: torrentReducer,
  });
}
