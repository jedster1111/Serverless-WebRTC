import React, { FC, useState } from 'react';
import { useServerlessWebRTC } from './hooks/useServerlessWebRTC';

export const Demo: FC<{ defaultIsHost: boolean }> = ({ defaultIsHost }) => {
    const [isHost, setIsHost] = useState(defaultIsHost);
    const [remoteDescriptionInput, setRemoteDescriptionInput] = useState('');

    const handleToggleButtonClick = () => setIsHost(prev => !prev);

    const {
        handleRemoteDescription,
        sendMessage,
        localDescription,
        logConnection,
        logChannel
    } = useServerlessWebRTC(isHost);

    const handleRemoteDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setRemoteDescriptionInput(e.target.value);

    const handleRemoteDescriptionClick = () => handleRemoteDescription(remoteDescriptionInput);
    const handleSendMessage = () => sendMessage(`Hey from ${isHost ? 'host' : 'client'}`);
    return (
        <div className='webrtc-wrapper'>
            <span>{isHost ? 'Host' : 'Client'}</span>
            <button onClick={handleToggleButtonClick}>Toggle Host/Client</button>
            <input value={remoteDescriptionInput} onChange={handleRemoteDescriptionInputChange} />
            <button onClick={handleRemoteDescriptionClick}>Set remote description</button>
            <button onClick={handleSendMessage}>Send Message</button>
            <div>{localDescription}</div>
            <button onClick={logConnection}>Log Connection</button>
            <button onClick={logChannel}>Log Channel</button>
        </div>
    );
};
