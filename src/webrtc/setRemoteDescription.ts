export async function setRemoteDescription(
    connection: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
): Promise<void> {
    console.log(`[setRemoteDescription]: Set remote description with offer: ${JSON.stringify(offer)}`);
    connection.setRemoteDescription(offer);
}
