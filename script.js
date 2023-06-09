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
pc1.onicecandidate = (e) => pc2.addIceCandidate(e.candidate);
pc2.onicecandidate = (e) => pc1.addIceCandidate(e.candidate);

// to preview stream
pc2.ontrack = (e) => {
  userTwo.srcObject = e.streams[0];
};

// open stream mainStream userOne and preview userTwo
let openStream = async (stream) => {
  if (stream) this.stream = stream;
  if (!this.stream) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    getInputDevice();
  }
  userOne.srcObject = this.stream;

  this.stream.getTracks().forEach((t) => {
    pc1.addTrack(t, this.stream);
  });
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
    video: true,
    audio: {
      deviceId: selectedInput,
    },
  });
  stopStream(userTwo.srcObject);
  userTwo.srcObject = newStream;
};

// save preview stream to main stream and remove main stream and preview stream and open new
let saveChangeAudio = async () => {
  if (selectedInput) {
    stopStream(this.stream);
    openStream(newStream);
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
