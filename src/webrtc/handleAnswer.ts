export async function handleAnswer(
    connection: RTCPeerConnection,
    answer: RTCSessionDescriptionInit
) {
    const rtcSessionDescription = new RTCSessionDescription(answer);
    connection.setRemoteDescription(rtcSessionDescription);
}
