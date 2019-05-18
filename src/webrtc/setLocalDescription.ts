export async function setLocalDescription(
    connection: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
): Promise<void> {
    console.log(
        `[setLocalDescription]: Set local description with offer: ${JSON.stringify(offer)}`
    );
    connection.setLocalDescription(offer);
}
