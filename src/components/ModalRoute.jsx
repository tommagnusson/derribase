/* eslint-disable arrow-body-style */
import React, { PureComponent } from 'react';
import Transition from 'react-transition-group/Transition';
import { withRouter, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import { lockBodyScroll } from '../lib/dom';
import actions from '../redux/app/actions';
import styles from '../app.scss';
import CloseIcon from '../icons/close.svg';

class ModalRoute extends PureComponent {
  constructor(props) {
    super(props);
    this.title = props.title;
    this.state = {
      title: typeof this.title === 'function' ? null : this.title
    };
  }
  componentWillReceiveProps(nextProps) {
    if (typeof this.title === 'function') {
      const title = this.title(nextProps);
      if (title) {
        this.setState({ title });
      }
    }
  }
  onTransition(isIn) {
    this.props.showMask(isIn);
    lockBodyScroll(isIn);
  }
  render() {
    const {
      path,
      component: Component,
      location,
      history,
      appState
    } = this.props;

    const inProp = Boolean(matchPath(location.pathname, { path }))
      && appState.status === 'READY';

    const passProps = typeof this.props.passProps === 'function'
      ? this.props.passProps(this.props)
      : this.props.passProps;

    return (
      <Transition
        in={inProp}
        timeout={200}
        onEntering={() => this.onTransition(true)}
        onExiting={() => this.onTransition(false)}
        appear
      >
        {(state) => {
          return (
            <div className={cx(styles.modal, {
              [styles.show]: state === 'entered'
            })}>
              <div
                className={styles.mask}
                onClick={() => history.goBack()}
              />
              <div className={styles.contentHeader}>
                <span>{this.state.title}</span>
                <CloseIcon onClick={() => history.goBack()} />
              </div>
              <div className={styles.content}>
                <Component {...passProps} />
              </div>
            </div>
          );
        }}
      </Transition>
    );
  }
}

export default withRouter(connect(state => ({
  appState: state.app,
}), actions)(ModalRoute));