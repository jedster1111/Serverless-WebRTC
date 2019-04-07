import React, { ChangeEvent, Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { createAnswer } from '../webrtc/createAnswer';
import { handleNewICECandidate } from '../webrtc/handleNewICECandidate';
import { setLocalDescription } from '../webrtc/setLocalDescription';
import { setRemoteDescription } from '../webrtc/setRemoteDescription';
import { createWebRTCCPeerConnection, deStringifyOffer } from '../webrtc/webRTCUtils';

export const WebRTCClient: FC = () => {
    const [connection] = useState<RTCPeerConnection>(createWebRTCCPeerConnection());
    const [offerInputValue, setOfferInputValue] = useState<string>('');
    // const [offer, setOffer] = useState<RTCSessionDescriptionInit>();
    const offerRef = useRef<RTCSessionDescriptionInit>();
    const [isGatheringICECandidates, setIsGatheringICECandidates] = useState(true);
    const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);
    const [latestAnswer, setAnswer] = useState<RTCSessionDescriptionInit>();
    const chatChannelRef = useRef<RTCDataChannel>();

    useEffect(() => {
        console.log('[WebRTCClient]: Setting up WebRTC Client!');

        connection.createDataChannel('testing');

        connection.addEventListener('icecandidate', event =>
            handleNewICECandidate(event, setCandidates, setIsGatheringICECandidates)
        );
        connection.addEventListener('icegatheringstatechange', () =>
            handleGatheringStateChange(connection, setAnswer, offerRef.current)
        );
        connection.addEventListener('signalingstatechange', () => {
            console.log(`[WebRTCClient]: Set signalling state set to - ${connection.signalingState}`);
        });
        connection.addEventListener('datachannel', e => {
            console.log('Data channel event!', e);
            const chatChannel = e.channel;
            chatChannelRef.current = chatChannel;

            chatChannel.onmessage = messageEvent => console.log(messageEvent);
        });
    }, [connection]);

    const handleOfferInputValueChange = (e: ChangeEvent<HTMLInputElement>) => setOfferInputValue(e.target.value);
    const handleSendMessageClick = () => {
        chatChannelRef.current && chatChannelRef.current.send('Hello world from client');
    };
    const onCreateAnswerButtonClick = async () => {
        const receivedOffer = deStringifyOffer(offerInputValue);

        if (!receivedOffer.sdp) {
            throw new Error('There was no sdp string in received offer?');
        }

        // setOffer(receivedOffer);
        offerRef.current = receivedOffer;

        console.log(`[WebRTCClient]: Set remote description`);
        await setRemoteDescription(connection, receivedOffer);

        const answer = await createAnswer(connection);
        setAnswer(answer);

        console.log(`[WebRTCClient]: Set local description`);
        await setLocalDescription(connection, answer);
    };

    const onClick = () => console.log(connection);

    return (
        <div className='webrtc-wrapper'>
            <h2>Client!</h2>
            <button onClick={handleSendMessageClick}>Send message to host</button>
            <input value={offerInputValue} onChange={handleOfferInputValueChange} />
            <button onClick={onCreateAnswerButtonClick}>Create Answer</button>
            <p>{isGatheringICECandidates ? 'Gathering Candidates...' : 'Got list of candidates'}</p>
            <ul className='webrtc-ice-list'>
                {candidates.map((candidate, index) => (
                    <li key={index}>{JSON.stringify(candidate)}</li>
                ))}
            </ul>
            {latestAnswer && <p>{JSON.stringify(latestAnswer)}</p>}
            <button onClick={onClick}>Log connection</button>
        </div>
    );
};

async function handleGatheringStateChange(
    connection: RTCPeerConnection,
    setAnswer: Dispatch<SetStateAction<RTCSessionDescriptionInit | undefined>>,
    offer: RTCSessionDescriptionInit | undefined
) {
    console.log(
        `[handleGatheringStateChange]: Ice candidate gathering state changed to ${connection.iceGatheringState}!`
    );
    switch (connection.iceGatheringState) {
        case 'complete': {
            if (!offer) {
                throw new Error('No offer?');
            }

            connection.setRemoteDescription(offer);
            const answer = await createAnswer(connection);
            setAnswer(answer);
            await setLocalDescription(connection, answer);
            break;
        }
        case 'gathering': {
            console.log(`[handleGatheringStateChange]: Started gathering ICE candidates!`);
            break;
        }
        case 'new': {
            break;
        }
    }
}
