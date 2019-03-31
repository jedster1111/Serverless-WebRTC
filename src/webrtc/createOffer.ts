/**
 * Creates a webRTC offer and returns the offer.
 * @param {RTCPeerConnection} connection A RTCPeerConnection object.
 */
export async function createOffer(connection: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
    const offer = await connection.createOffer();
    console.log(`[createOffer]: Created offer: ${JSON.stringify(offer)}`);
    return offer;
}
