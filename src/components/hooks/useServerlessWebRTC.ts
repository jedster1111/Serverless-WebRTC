import { useEffect, useRef, useState } from 'react';
import { deStringifyOffer } from '../../webrtc/webRTCUtils';

const defaultRTCConfig: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    iceCandidatePoolSize: 6
};

export function useServerlessWebRTC(isHost: boolean, RTCConfig?: RTCConfiguration) {
    const [connection] = useState<RTCPeerConnection>(
        new RTCPeerConnection({ ...defaultRTCConfig, ...RTCConfig })
    );

    const [localDescription, setLocalDescription] = useState<RTCSessionDescription>();
    const [remoteDescription, setRemoteDescription] = useState<RTCSessionDescription>();

    const offerRef = useRef<RTCSessionDescription>();

    // const [onMessage, setOnMessage] = useState<(e: MessageEvent) => void>(defaultHandleMessage);

    const createDataChannel = () => {
        const dataChannel = connection.createDataChannel('chat');
        dataChannel.onmessage = defaultHandleMessage;
        return dataChannel;
    };
    const chatChannelRef = useRef<RTCDataChannel | null>(isHost ? createDataChannel() : null);

    const sendMessage = (message: string) => {
        const chatChannel = chatChannelRef.current;
        if (chatChannel) {
            console.log(`Sending message ${message}`);
            chatChannel.send(message);
        } else {
            console.log(`There's no chatChannel at the moment?`);
        }
    };

    const logConnection = () => console.log(connection);
    const logChannel = () => console.log(chatChannelRef.current);

    const handleRemoteDescription = isHost
        ? async (initDescription: string) => {
              const receivedDescription = deStringifyOffer(initDescription);

              if (!receivedDescription.sdp) {
                  throw new Error('There was no sdp string in received offer?');
              }

              console.log('Setting remote description to', receivedDescription);
              await connection.setRemoteDescription(receivedDescription);
              const newRemoteDescription = connection.remoteDescription;

              if (!newRemoteDescription) {
                  throw new Error("Remote description wasn't set for some reason");
              }

              setRemoteDescription(newRemoteDescription);
          }
        : async (initDescription: string) => {
              const receivedDescription = deStringifyOffer(initDescription);

              if (!receivedDescription.sdp) {
                  throw new Error('There was no sdp string in received offer?');
              }

              console.log(`Client: Set remote description`);
              await connection.setRemoteDescription(receivedDescription);
              const newRemoteDescription = connection.remoteDescription;

              if (!newRemoteDescription) {
                  throw new Error("Remote description wasn't set for some reason");
              }

              //   setRemoteDescription(newRemoteDescription);
              offerRef.current = receivedDescription;

              const newAnswer = await connection.createAnswer();
              console.log(`Client: Set local description`);
              await connection.setLocalDescription(newAnswer);

              const newLocalDescription = connection.localDescription;

              if (!newLocalDescription) {
                  throw new Error('No local description?');
              }

              setLocalDescription(newLocalDescription);
          };

    // useEffect(() => {
    //     const chatChannel = chatChannelRef.current;
    //     if (chatChannel) {
    //         chatChannel.onmessage = onMessage;
    //     }
    // }, [onMessage]);

    useEffect(() => {
        async function setUpHost() {
            console.log('[useServerlessWebRTC]: Setting up Host');
            connection.addEventListener('icegatheringstatechange', async () => {
                console.log(
                    `Ice candidate gathering state changed to ${connection.iceGatheringState}!`
                );
                switch (connection.iceGatheringState) {
                    case 'complete': {
                        const finalOffer = await connection.createOffer();
                        await connection.setLocalDescription(finalOffer);
                        const finalLocalDescription = connection.localDescription;

                        if (!finalLocalDescription) {
                            throw new Error("Local description wasn't set for some reason");
                        }
                        setLocalDescription(finalLocalDescription);
                        break;
                    }
                }
            });

            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            const newLocalDescription = connection.localDescription;

            if (!newLocalDescription) {
                throw new Error("Local description wasn't set for some reason");
            }
        }

        function setUpClient() {
            console.log('[useServerlessWebRTC]: Setting up Client');
            connection.createDataChannel('necessary');

            connection.addEventListener('icegatheringstatechange', async () => {
                console.log(
                    `Ice candidate gathering state changed to ${connection.iceGatheringState}!`
                );
                switch (connection.iceGatheringState) {
                    case 'complete': {
                        if (!offerRef.current) {
                            throw new Error("There's no remote offer?");
                        }

                        connection.setRemoteDescription(offerRef.current);
                        const answer = await connection.createAnswer();
                        await connection.setLocalDescription(answer);
                        const finalLocalDescription = connection.localDescription;

                        if (!finalLocalDescription) {
                            throw new Error("Local description wasn't set for some reason");
                        }

                        setLocalDescription(finalLocalDescription);
                    }
                }
            });

            connection.addEventListener('datachannel', e => {
                const channel = e.channel;
                chatChannelRef.current = channel;

                channel.onmessage = defaultHandleMessage;
            });
        }

        connection.addEventListener('icecandidate', e => {
            const { candidate } = e;
            if (candidate) {
                console.log(`[serverlessWebRTC]: Received ICE candidate - ${candidate.candidate}`);
            } else {
                console.log(`[serverlessWebRTC]: Finished collecting ICE candidates`);
            }
        });

        connection.addEventListener('signalingstatechange', () => {
            console.log(
                `[serverlessWebRTC]: Set signalling state set to - ${connection.signalingState}`
            );
        });

        isHost ? setUpHost() : setUpClient();
    }, [connection]);

    return {
        localDescription: localDescription ? JSON.stringify(localDescription) : undefined,
        remoteDescription: remoteDescription ? JSON.stringify(remoteDescription) : undefined,
        // setOnMessage,
        sendMessage,
        handleRemoteDescription,
        logConnection,
        logChannel
    };
}

function defaultHandleMessage(e: MessageEvent) {
    console.log(e);
}
