const socket = io('/');
const videoGrid = document.getElementById("video-grid");
const connectedPeers = {};
const myPeer = new Peer(undefined,{
    host: '/',
    port: '3001'
});

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream)=>{
    console.log(stream);
    //when user recives a call 
    myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream',(userVideoStream) => {
            addVideoStream(video,userVideoStream);
        });
    });
    
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', (userId) => {
        if(connectedPeers[userId])
            connectedPeers[userId].close()
    });

    addVideoStream(myVideo,stream);
})
//when a user makes a call.
const connectToNewUser = (userId, stream) =>{
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream',(userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close',() => { 
        video.remove();
    });

    connectedPeers[userId] = call;
    
}

myPeer.on('open',(id)=>{
    socket.emit('join-room', ROOM_ID, id);
});

const addVideoStream = (video, stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    });
    videoGrid.append(video);
}