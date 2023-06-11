const pc1 = new RTCPeerConnection();
const pc2 = new RTCPeerConnection();
let audioList = document.getElementById("audioList");
let selectList = document.createElement("select");
let userOne = document.getElementById("user-1");
let userTwo = document.getElementById("user-2");
let inputDeviceList;
let audioDevicesList;
let stream;
let selectedInput;
let newStream;
let audioStream;
let videoStream;
let sender;
pc1.onicecandidate = (e) => pc2.addIceCandidate(e.candidate);
pc2.onicecandidate = (e) => pc1.addIceCandidate(e.candidate);

// to preview stream
pc2.ontrack = (e) => {
  userTwo.srcObject = e.streams[0];
};

// open stream mainStream userOne and preview userTwo
let openStream = async () => {
  if (!videoStream) {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
  }

  if (!audioStream) {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
  }

  if (!audioDevicesList) getInputDevice();

  outputMediaStream = new webkitMediaStream([
    ...audioStream.getTracks(),
    ...videoStream.getTracks(),
  ]);

  outputMediaStream.getTracks().forEach((t) => {
    if (sender) pc1.removeTrack(sender);
    sender = pc1.addTrack(t, outputMediaStream);
  });

  userOne.srcObject = videoStream;

  // to connect pc1 and pc2
  startConnection(pc1, pc2);
  console.log({audioStream,videoStream});
};

// connect with webRTC
let startConnection = async (pc1, pc2) => {
  await pc1.createOffer({}).then(function (offer) {
    pc1.setLocalDescription(offer);
    pc2.setRemoteDescription(offer);
    pc2.createAnswer().then(function (answer) {
      pc2.setLocalDescription(answer);
      pc1.setRemoteDescription(answer);
    });
  });
};

// get input device list to show them and change
let getInputDevice = async () => {
  inputDeviceList = await navigator.mediaDevices.enumerateDevices();
  audioDevicesList = inputDeviceList.filter(
    (device) => device.kind == "audioinput"
  );
  addDevices();
};

// create audio devices list
let addDevices = async () => {
  selectList.id = "mySelect";
  audioList.appendChild(selectList);
  document.getElementById("mySelect").addEventListener("change", (event) => {
    selectedInput = event.target.value;
    changeAudio();
  });
  audioDevicesList.forEach((device) => {
    var option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label;
    selectList.appendChild(option);
  });
};

// select new input audio from audio list and show in preview
let changeAudio = async () => {
  newStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: selectedInput,
    },
  });
};

// save preview stream to main stream and remove main stream and preview stream and open new
let saveChangeAudio = async () => {
  if (selectedInput) {
    stopStream(audioStream);
    audioStream = newStream;
    openStream();
    selectedInput = undefined;
    console.log({audioStream,videoStream});
  }
};

// close stream before open new stream if exist
let stopStream = (stream) => {
  if (stream) {
    for (let track of stream.getTracks()) {
      track.stop();
      console.log("stoooooooop");
    }
  }
};

openStream();
