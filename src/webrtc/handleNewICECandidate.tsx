import { Dispatch, SetStateAction } from 'react';
export function handleNewICECandidate(
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
