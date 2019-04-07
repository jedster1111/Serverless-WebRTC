export async function createAnswer(connection: RTCPeerConnection) {
    const answer = await connection.createAnswer();
    console.log(`[createAnswer]: Created answer - ${JSON.stringify(answer)}`);
    return answer;
}
