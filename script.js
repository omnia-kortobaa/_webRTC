const pc1 = new RTCPeerConnection();
const pc2 = new RTCPeerConnection();
let inputDeviceList;
let audioDevicesList;
pc1.onicecandidate = (e) => pc2.addIceCandidate(e.candidate);
pc2.onicecandidate = (e) => pc1.addIceCandidate(e.candidate);
const id2content = {};
pc2.ontrack = (e) => {
  document.getElementById("user-2").srcObject = e.streams[0];
};

let establishConnection = async (pc1, pc2) => {
  await pc1.createOffer({}).then(function (offer) {
    pc1.setLocalDescription(offer);
    pc2.setRemoteDescription(offer);
    pc2.createAnswer().then(function (answer) {
      pc2.setLocalDescription(answer);
      pc1.setRemoteDescription(answer);
    });
  });
};

let open = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  document.getElementById("user-1").srcObject = stream;
  stream.getTracks().forEach((t) => {
    pc1.addTrack(t, stream);
  });
  
  establishConnection(pc1, pc2);
};

function addElement() {
  const newSelect = document.createElement("select");
  const newOption = document.createElement("option");

  newSelect.appendChild(newOption);

  document.body.append(newSelect);
}

// get input device list to show them and change
let getInputDevice = async () => {
//   inputDeviceList = await navigator.mediaDevices.enumerateDevices();
//   console.log(inputDeviceList);
//   audioDevicesList = inputDeviceList.filter(
//     (device) => device.kind == "audioinput"
//   );
//   console.log(navigator.mediaDevices.enumerateDevices()));

};

open();
getInputDevice()
