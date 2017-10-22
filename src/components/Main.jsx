/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import { BrowserRouter as Router, Route, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';

import Navbar from './Navbar.jsx';
import Menu from './Menu.jsx';
import DocContainer from './DocContainer.jsx';
import Search from './Search.jsx';
import Source from './Source.jsx';
import ModalRoute from './ModalRoute.jsx';
import Loader from './Loader.jsx';
import defer from './Defer.jsx';
import actions from '../redux/app/actions';

import styles from '../app.scss';

const actionQ = [
  [
    {
      action: props => props.fetchEntries(),
      completeWhen: props => props.appState.entryList,
      message: 'Loading entries'
    },
    {
      action: props => props.fetchBiblio(),
      completeWhen: props => props.appState.biblio,
      message: 'Loading bibliography'
    }
  ],
  [
    {
      action: props => props.fetchDoc(),
      completeWhen: props => props.appState.doc,
      message: 'Loading full index'
    },
    {
      action: props => props.indexEntries(props.appState.entryList),
      completeWhen: props => props.searchState.isIndexed,
      message: 'Indexing entries'
    }
  ]
];

class Main extends PureComponent {
  constructor(props) {
    super(props);

    this.DocContainer = defer({
      Wrapped: DocContainer,
      untilStatus: 'READY',
    });

    this.Source = defer({
      Wrapped: Source,
      untilStatus: 'READY',
    });
  }
  render() {
    const { appState } = this.props;
    const sourcePath = '(.*)/source::sid/(.*)?';
    const sidFromPath = (props) => {
      const match = matchPath(
        props.location.pathname,
        '(.*)/source::sid/(.*)?'
      );
      return (match && match.params.sid) || null;
    };
    return (
      <Router>
        <Transition
          in={appState.showMask}
          timeout={50}
        >
          {(state) => {
            return (
              <div className={cx(styles.app, {
                [styles.showWithMask]: state === 'entered'
              })}>
                <div className={cx(styles.mask, {
                  [styles.show]: state === 'entering' || state === 'entered'
                })}>
                  <this.DocContainer />
                </div>
                <ModalRoute
                  path={sourcePath}
                  component={this.Source}
                  passProps={props => ({ sid: sidFromPath(props) })}
                  title={sidFromPath}
                />
                <Navbar withMaskClassName={styles.withMask} />
                <Menu path='(.*)#!menu' />
                <Loader
                  queue={actionQ}
                  onComplete={() => this.props.setStatus('READY')}
                />
              </div>
            );
          }}
        </Transition>
      </Router>
    );
  }
}

export default connect(state => ({
  appState: state.app,
}), actions)(Main);
