/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import HomePage from './pages/HomePage';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "TorrentPage" */ './pages/TorrentPage')
);

const TorrentPage = (props: Record<string, unknown>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <Switch>
      <Route path={routes.COUNTER} component={TorrentPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  );
}
