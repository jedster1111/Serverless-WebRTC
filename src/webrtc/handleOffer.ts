export async function handleOffer(connection: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
    const rtcSessionDescription = new RTCSessionDescription(offer);
    await connection.setRemoteDescription(rtcSessionDescription);

    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);

    return answer;
}
