import React from 'react';
import { connect } from 'react-redux';

class App extends React.Component {
    constructor() {
        super();
    }
    handleChange = () => {
        this.props.setText('model-redux');
    };

    forwardAction = () => {
        this.props.forwardAction();
    };

    render() {
        const { text } = this.props;
        return (
            <div>
                <header className="header">{text}</header>
                <button className="change" onClick={this.handleChange}>
                    change
                </button>
                <button className="forwardAction" onClick={this.forwardAction}>
                    forwardAction
                </button>
            </div>
        );
    }
}

export default connect(
    ({ app }) => {
        return {
            text: app.text,
        };
    },
    dispatch => ({
        setText: text =>
            dispatch({
                type: 'app/setText',
                payload: text,
            }),
        forwardAction: text =>
            dispatch({
                type: 'app/forwardAction',
            }),
    }),
)(App);
