import React, { ChangeEvent, Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { createOffer } from '../webrtc/createOffer';
import { handleNewICECandidate } from '../webrtc/handleNewICECandidate';
import { setLocalDescription } from '../webrtc/setLocalDescription';
import { setRemoteDescription } from '../webrtc/setRemoteDescription';
import { createWebRTCCPeerConnection, deStringifyOffer } from '../webrtc/webRTCUtils';

export const WebRTCHost: FC = () => {
    const [connection] = useState<RTCPeerConnection>(createWebRTCCPeerConnection());
    const [isGatheringICECandidates, setIsGatheringICECandidates] = useState(true);
    const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);
    const [latestOffer, setOffer] = useState<RTCSessionDescriptionInit>();
    const [answerInputValue, setAnswerInputValue] = useState<string>('');
    const chatChannelRef = useRef<RTCDataChannel>();

    useEffect(() => {
        console.log('[WebRTCHost]: Setting up WebRTC Host!');

        async function setUpWebRTC() {
            const chatChannel = connection.createDataChannel('chat');
            chatChannelRef.current = chatChannel;

            chatChannel.onmessage = e => console.log(e);

            const offer = await createOffer(connection);
            setOffer(offer);
            console.log(`[setUpWebRTC]: Set offer to ${JSON.stringify(offer)}`);

            // ICE candidate gathering should start after setting local description.
            setLocalDescription(connection, offer);
        }

        // EVENT LISTENERS
        connection.addEventListener('icecandidate', event =>
            handleNewICECandidate(event, setCandidates, setIsGatheringICECandidates)
        );
        connection.addEventListener('icegatheringstatechange', () => handleGatheringStateChange(connection, setOffer));
        connection.addEventListener('signalingstatechange', () => {
            console.log(`[WebRTCClient]: Set signalling state set to - ${connection.signalingState}`);
        });

        setUpWebRTC();
    }, [connection]);

    const handleSendMessageClick = () => {
        const chatChannel = chatChannelRef.current;
        if (!chatChannel) {
            console.log("No chat channel yet, are you sure you're connectd?");
        } else {
            chatChannel.send('Hello world!');
        }
    };
    const handleAnswerInputChange = (e: ChangeEvent<HTMLInputElement>) => setAnswerInputValue(e.target.value);
    const onEnterAnswerButtonClick = async () => {
        const receivedAnswer = deStringifyOffer(answerInputValue);

        if (!receivedAnswer.sdp) {
            throw new Error('There was no sdp string in received answer?');
        }

        console.log(`[WebRTCHost]: Set remote description`);
        await setRemoteDescription(connection, receivedAnswer);
    };
    const onClick = () => console.log(connection);
    return (
        <div className='webrtc-wrapper'>
            <h2>WebRTC Host!</h2>
            <button onClick={handleSendMessageClick}>Send message</button>
            <input value={answerInputValue} onChange={handleAnswerInputChange} />
            <button onClick={onEnterAnswerButtonClick}>Enter client answer</button>
            <p>{isGatheringICECandidates ? 'Gathering Candidates...' : 'Got list of candidates'}</p>
            <ul className='webrtc-ice-list'>
                {candidates.map((candidate, index) => (
                    <li key={index}>{JSON.stringify(candidate)}</li>
                ))}
            </ul>
            {latestOffer && <p>{JSON.stringify(latestOffer)}</p>}
            <button onClick={onClick}>Log connection</button>
        </div>
    );
};

async function handleGatheringStateChange(
    connection: RTCPeerConnection,
    setOffer: Dispatch<SetStateAction<RTCSessionDescriptionInit | undefined>>
) {
    console.log(
        `[handleGatheringStateChange]: Ice candidate gathering state changed to ${connection.iceGatheringState}!`
    );
    switch (connection.iceGatheringState) {
        case 'complete': {
            const offer = await createOffer(connection);
            setOffer(offer);
            console.log(`[handleGatheringStateChange]: Updated offer - ${JSON.stringify(offer)}`);
            break;
        }
        case 'gathering': {
            break;
        }
        case 'new': {
            break;
        }
    }
}
