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
let audioDeviceId;
let videoDeviceId;
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
      video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
    });
  }

  if (!audioStream) {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
    });
  }

  if (!audioDevicesList) getInputDevice();

  audioDeviceId = audioStream.getAudioTracks()[0].getSettings().deviceId;
  videoDeviceId = videoStream.getVideoTracks()[0].getSettings().deviceId;

  document.getElementById(
    "p1Input"
  ).innerHTML = `<span> audio input device : ${audioDeviceId}
  </span> <span> video input device : ${videoDeviceId}
  </span>`;
  document.getElementById(
    "p2Input"
  ).innerHTML = `<span> audio input device : ${audioDeviceId}
  </span> <span> video input device : ${videoDeviceId}
  </span>`;

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
    ChangeAudio();
  });
  audioDevicesList.forEach((device) => {
    var option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label;
    selectList.appendChild(option);
  });
};

// select new input audio from audio list and show in preview
let ChangeAudio = async () => {
  newStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: selectedInput,
    },
  });
  audioDeviceId = newStream.getAudioTracks()[0].getSettings().deviceId;
  document.getElementById(
    "p2Input"
  ).innerHTML = `<span> audio input device : ${audioDeviceId}
  </span> <span> video input device : ${videoDeviceId}
  </span>`;
};

// save preview stream to main stream and remove main stream and preview stream and open new
let saveChangeAudio = async () => {
  if (selectedInput) {
    stopStream(audioStream);
    audioStream = newStream;
    openStream();
    selectedInput = undefined;
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
