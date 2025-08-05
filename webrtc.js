const socket = io();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let peerConnection;

function startCall() {
    const configuration = {
        'iceServers': [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun.l.google.com:5349" },
                        { urls: "stun:stun1.l.google.com:3478" },
                        { urls: "stun:stun1.l.google.com:5349" },
                        { urls: "stun:stun2.l.google.com:19302" },
                        { urls: "stun:stun2.l.google.com:5349" },
                        { urls: "stun:stun3.l.google.com:3478" },
                        { urls: "stun:stun3.l.google.com:5349" },
                        { urls: "stun:stun4.l.google.com:19302" },
                        { urls: "stun:stun4.l.google.com:5349" }
                    ]
    };
    peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            // Send the candidate to the remote peer
            sendSignalingData({ 'candidate': event.candidate });
        }
    };

    // Once remote track media is received, display it at the remote video element.

    peerConnection.ontrack = function(event) {
        remoteVideo.srcObject = event.streams[0];
    };

    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localVideo.srcObject = stream;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        })
        .catch(error => console.error('Error accessing media devices.', error));
}

// Establishing signaling
function handleSignalingData(data) {
    switch(data.type) {
        case 'offer':
            handleOffer(data.offer);
            break;
        case 'answer':
            handleAnswer(data.answer);
            break;
        case 'candidate':
            handleCandidate(data.candidate);
            break;
        default:
            break;
    }
}

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    // create an answer to send back to the peer
    peerConnection.createAnswer().then(answer => {
        peerConnection.setLocalDescription(answer);
        sendSignalingData({ type: 'answer', answer: answer });
    });
}

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Send signaling data to the server
function sendSignalingData(data) {
    socket.emit('signal', data);
}

// Listen for signaling data from the server
socket.on('signal', (data) => {
    handleSignalingData(data);
});

document.addEventListener('DOMContentLoaded', startCall);
