import React, { PureComponent } from 'react';
import { Route, matchPath } from 'react-router-dom';
import Transition from 'react-transition-group/Transition';
import cx from 'classnames';
import Doc from './Doc.jsx';
import styles from '../app.scss';

const tranStyles = {

};
tranStyles.entering = tranStyles.entered;
tranStyles.exiting = tranStyles.exited;

export default class DocContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.asidePath = '/(motif|source|search)/(.*)/motif::term';
    this.state = {
      query: this.getQuery(this.props)
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      query: this.getQuery(nextProps)
    });
  }
  getQuery(props) {
    const aside = matchPath(props.location.pathname, this.asidePath);
    return {
      term: props.match.params.term,
      search: props.match.params[0] === 'search',
      motif: props.match.params[0] === 'motif',
      source: props.match.params[0] === 'source',
      aside: Boolean(aside && aside.params.term)
    };
  }
  render() {
    return (
      <Transition in={this.state.query.aside} timeout={300}>
        {state => (
          <div className={cx(styles.doc, styles[state])}>
            <Route
              path='/(motif|source|search)/:term'
              render={props => (
                <main>
                  <Doc
                    query={this.getQuery(props)} path={['main']}
                    ready={state === 'entered'}
                  />
                </main>
              )}
            />
            <Route
              path={this.asidePath}
              render={props => (
                <aside>
                  <Doc
                    query={{
                      motif: true,
                      term: props.match.params.term
                    }}
                    path={['aside']}
                    ready={state === 'entered'}
                  />
                </aside>
              )}
            />
          </div>
        )}
      </Transition>
    );
  }
}