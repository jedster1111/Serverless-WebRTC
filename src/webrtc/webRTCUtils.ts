// See https://mdn.mozillademos.org/files/12363/WebRTC%20-%20Signaling%20Diagram.svg for a good diagram explaining flow

export function createWebRTCCPeerConnection() {
    return new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceCandidatePoolSize: 6
    });
}

export async function createOffer(connection: RTCPeerConnection) {
    return connection.createOffer();
}

export function stringifyOffer(offer: RTCSessionDescriptionInit): string {
    return JSON.stringify(offer);
}

export function deStringifyOffer(offer: string): RTCSessionDescription {
    const result = JSON.parse(offer) as unknown;
    if (!isRTCSessionDescriptionInit(result)) {
        throw new Error('Did not get a RTCSessionDescriptionInit object. Are you sure you passed in the right string?');
    }
    return new RTCSessionDescription(result);
}

export function createSessionDescription(sdpOffer: RTCSessionDescriptionInit) {
    return new RTCSessionDescription(sdpOffer);
}

export function isRTCSessionDescriptionInit(result: unknown): result is RTCSessionDescriptionInit {
    // TODO: Add a suitable check here
    return !!result;
}
