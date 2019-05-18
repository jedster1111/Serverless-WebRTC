import React, { Component } from 'react';
import './App.css';
import { Demo } from './Demo';
import './WebRTC.css';

class App extends Component {
    render() {
        return (
            <div className='App'>
                <div className='App-body'>
                    <Demo defaultIsHost={true} />
                    <Demo defaultIsHost={false} />
                </div>
            </div>
        );
    }
}

export default App;
