import React, { Component } from 'react';
import './App.css';
import './WebRTC.css';
import { WebRTCClient } from './WebRTCClient';
import { WebRTCHost } from './WebRTCHost';

class App extends Component {
    render() {
        return (
            <div className='App'>
                <div className='App-body'>
                    <WebRTCHost />
                    <WebRTCClient />
                </div>
            </div>
        );
    }
}

export default App;
