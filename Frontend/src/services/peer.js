class PeerService {
    constructor() {
        // This check if peer already exists. If not it creates a new RTCPeerConnection instance
        if(!this.peer) {
            // Create a new peer connection object with ICE servers for NATs (Network Address Translators) traversal
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302", // Google STUN server
                            "stun:global.stun.twilio.com:3478", // Twilio STUN server
                        ],
                    },
                ],
            });
        }
    }
    // Accepts an incoming offer and generates and answer
    async getAnswer(offer) {
        if(this.peer) {
            // Set the received offer as the remote description of the current peer connection.
            await this.peer.setRemoteDescription(offer);
            // create an answer to the offer
            const answer = await this.peer.createAnswer();
            // set the local description (answer) to be sent back to the offerer
            await this.peer.setLocalDescription(new RTCSessionDescription(answer));
        
            return answer;
        }
    }

    async setLocalDescription(answer) {
        if(this.peer) {
            // Set the received answer as the remote description
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async getOffer() {
        if(this.peer) {
            // Create an offer to initiate the connection
            const offer = await this.peer.createOffer();
            // Set the local description (the offer)
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));

            return offer;
        }
    }
}


export default new PeerService();