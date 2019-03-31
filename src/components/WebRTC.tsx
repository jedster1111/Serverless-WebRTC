import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { createOffer } from '../webrtc/createOffer';
import { setLocalDescription } from '../webrtc/setLocalDescription';
import { createWebRTCCPeerConnection } from '../webrtc/webRTCUtils';
import './WebRTC.css';

export const WebRTC: FC = () => {
    const [connection] = useState<RTCPeerConnection>(createWebRTCCPeerConnection());
    const [isGatheringICECandidates, setIsGatheringICECandidates] = useState(true);
    const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);
    const [latestOffer, setOffer] = useState<RTCSessionDescriptionInit>();

    useEffect(() => {
        console.log('[WebRTC]: Setting up WebRTC!');

        async function setUpWebRTC() {
            connection.createDataChannel('chat');
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

        setUpWebRTC();
    }, [connection]);

    const onClick = () => console.log(connection);
    return (
        <div className='webrtc-wrapper'>
            <h2>WebRTC!</h2>
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

function handleNewICECandidate(
    event: RTCPeerConnectionIceEvent,
    setCandidates: Dispatch<SetStateAction<RTCIceCandidate[]>>,
    setIsGatheringICECandidates: Dispatch<SetStateAction<boolean>>
) {
    const { candidate } = event;
    if (candidate) {
        console.log(`[handleNewIceCandidate]: Received new ICE candidate - ${candidate.candidate}`);
        setCandidates(prevCandidates => [...prevCandidates, candidate]);
    } else {
        console.log(`[handleNewIceCandidate]: Finished collecting ICE candidates`);
        setIsGatheringICECandidates(false);
    }
}

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
