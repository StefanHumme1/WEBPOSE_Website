let recordingStartTime;
let mediaRecorder;
let recordedChunks = [];
let recordingTimer;
let startTime;

function startTimer() {
    // Reset startTime to the current time
    startTime = Date.now();

    // Update the timer every second
    recordingTimer = setInterval(() => {
        let elapsedTime = Date.now() - startTime;

        // Convert milliseconds to hours:minutes:seconds
        let hours = Math.floor(elapsedTime / 3600000); // 1 Hour = 3600000 Milliseconds
        let minutes = Math.floor((elapsedTime % 3600000) / 60000); // 1 Minute = 60000 Milliseconds
        let seconds = Math.floor(((elapsedTime % 360000) % 60000) / 1000);

        // Format the time string
        let formattedTime = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0'),
        ].join(':');

        // Display the timer
        document.getElementById('timer').innerText = formattedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(recordingTimer); // Stop updating the timer
    document.getElementById('timer').innerText = "00:00:00"; // Reset the timer display
}
function listAudioInputDevices() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
            const micSelect = document.getElementById('micSelect');
            micSelect.innerHTML = audioInputDevices.map(device => `<option value="${device.deviceId}">${device.label || 'Microphone'}</option>`).join('');
        })
        .catch(error => {
            console.error('Error listing audio input devices:', error);
        });
}

listAudioInputDevices();

function listVideoInputDevices() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            const videoSelect = document.getElementById('videoSelect');
            videoSelect.innerHTML = videoInputDevices.map(device =>
                `<option value="${device.deviceId}">${device.label || 'Camera'}</option>`
            ).join('');
        })
        .catch(error => {
            console.error('Error listing video input devices:', error);
        });
}


// Start recording the canvas stream
function startRecording() {
    recordedChunks = []; // Clear previous recording data
    recordingStartTime = Date.now();
    landmarksCache = [];

    // Get the selected audio and video device IDs
    const selectedMicId = document.getElementById('micSelect').value; // Assuming you have a similar selector for mics
    const audioConstraints = selectedMicId ? { deviceId: { exact: selectedMicId } } : true;

    // Example video device ID selection, assuming you have a similar setup for video input
    const selectedVideoId = document.getElementById('videoSelect').value; // Assuming you have a selector for video inputs
    const videoConstraints = selectedVideoId ? { deviceId: { exact: selectedVideoId } } : true;

    // Get the user media for both video and audio
    navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: videoConstraints })
        .then(stream => {
            setupMediaRecorder(stream);
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
}

function setupMediaRecorder(stream) {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'recordedSession.webm';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    startTimer(); // Start or continue the timer
}


// Stop recording
function stopRecording() {
    mediaRecorder.stop();
    stopTimer(); // Stop the timer
}
// Get the video element for input, the canvas element for output, and the control element
const video5 = document.getElementsByClassName('input_video5')[0];
const out5 = document.getElementsByClassName('output5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];

// Get the 2D drawing context of the output canvas
const canvasCtx5 = out5.getContext('2d');

// Create an FPS (Frames Per Second) control to track the frame rate
const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};

// Get the loading spinner element and hide it when the transition ends
function zColor(data) {
    const z = clamp(data.from.z + 0.5, 0, 1);
    return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function cachePoseLandmarks(results) {

  let isTurningSide = isPersonTurningSide(results.poseLandmarks);
  document.getElementById('turnStatus').innerText = isTurningSide ? '' : '';
  if(isTurningSide) {
    document.getElementById('turnStatus').style.display = 'none'; // Make it visible
  } else {
    document.getElementById('turnStatus').style.display = 'block'; // Hide it
    }
  console.log('Turning to the Side Detected:', isTurningSide);

  let handCloseToFace = isHandCloseToFace(results.poseLandmarks);
  document.getElementById('handCloseToFaceStatus').innerText = handCloseToFace ? 'Lower your hands' : 'Not Detected5';
  if(handCloseToFace) {
    document.getElementById('handCloseToFaceStatus').style.display = 'block'; // Make it visible
  } else {
    document.getElementById('handCloseToFaceStatus').style.display = 'none'; // Hide it
  }
  console.log('Hand Close To Face Detected:', handCloseToFace);
//crossedArms
  let crossedArms = analyseCrossedArms(results.poseLandmarks);
  document.getElementById('crossedArmsStatus').innerText = crossedArms ? 'Keep an open posture' : 'Not Detected1';
  if(crossedArms) {
    document.getElementById('crossedArmsStatus').style.display = 'block'; // Make it visible
  } else {
    document.getElementById('crossedArmsStatus').style.display = 'none'; // Hide it
  }
  console.log('Crossed Arms Detected:', crossedArms);
//crossedLegs
  let crossedLegs = analyseCrossedLegs(results.poseLandmarks);
  document.getElementById('crossedLegsStatus').innerText = crossedLegs ? 'Keep an open posture' : 'Legs out of field';
  if(crossedLegs) {
    document.getElementById('crossedLegsStatus').style.display = 'block'; // Make it visible
  } else {
    document.getElementById('crossedLegsStatus').style.display = 'none'; // Hide it
  }
  console.log('Crossed Legs Detected:', crossedLegs);
//noHandsStatus
  let noHands = analyseNoHands(results.poseLandmarks);
  document.getElementById('noHandsStatus').innerText = noHands ? 'Keep your hands visible' : 'Not Detected3';
  if(noHands) {
    document.getElementById('noHandsStatus').style.display = 'block'; // Make it visible
  } else {
    document.getElementById('noHandsStatus').style.display = 'none'; // Hide it
  }
  console.log('No Hands Detected:', noHands);



    // Calculate frame timestamp
    const frameStamp = (Date.now() - recordingStartTime) / 1000;

    // Convert landmarks to the desired frameAttributes format
    const frameAttributes = {};
    results.poseLandmarks.forEach((landmark, index) => {
        frameAttributes[`lm_${index}_x`] = landmark.x;
        frameAttributes[`lm_${index}_y`] = landmark.y;
    });

    // Store the frame with its timestamp and attributes
    const frame = {
        frameStamp: frameStamp.toFixed(3),  // Format to three decimal places
        frameAttributes: frameAttributes
    };
    landmarksCache.push(frame);
}

function saveCachedLandmarks() {
    //landmarkname function
    const recordingID = new Date(recordingStartTime).toISOString();
    const applicationName = "MediapipJS";
    const openName = null;
    const exportData = {
    RecordingID: recordingID,
    ApplicationName: applicationName,
    OpenName: openName,
    Frames: landmarksCache
};

    const json = JSON.stringify(exportData);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'cachedPoseLandmarks.json';

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
}
// Callback function for pose detection results
function onResultsPose(results) {
    // Add the 'loaded' class to the body to indicate that the results are ready
    document.body.classList.add('loaded');
    // Update the FPS display
    fpsControl.tick();
// Save the current canvas state, clear it, and draw the image from results
    canvasCtx5.save();
    canvasCtx5.clearRect(0, 0, out5.width, out5.height);
    canvasCtx5.drawImage(
        results.image, 0, 0, out5.width, out5.height);
          // Draw connectors to visualize pose landmarks connections
    drawConnectors(
        canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
            color: (data) => {
                const x0 = out5.width * data.from.x;
                const y0 = out5.height * data.from.y;
                const x1 = out5.width * data.to.x;
                const y1 = out5.height * data.to.y;

                const z0 = clamp(data.from.z + 0.5, 0, 1);
                const z1 = clamp(data.to.z + 0.5, 0, 1);

                const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
                gradient.addColorStop(
                    0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
                gradient.addColorStop(
                    1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
                return gradient;
            }
        });

  // Draw pose landmarks for left, right, and neutral poses with specified colors
    drawLandmarks(
        canvasCtx5,
        Object.values(POSE_LANDMARKS_LEFT)
            .map(index => results.poseLandmarks[index]),
        { color: zColor, fillColor: '#FF0000' });
    drawLandmarks(
        canvasCtx5,
        Object.values(POSE_LANDMARKS_RIGHT)
            .map(index => results.poseLandmarks[index]),
        { color: zColor, fillColor: '#00FF00' });
    drawLandmarks(
        canvasCtx5,
        Object.values(POSE_LANDMARKS_NEUTRAL)
            .map(index => results.poseLandmarks[index]),
        { color: zColor, fillColor: '#AAAAAA' });
    canvasCtx5.restore();

    // Cache the landmarks
    cachePoseLandmarks(results);
}

// Create an instance of the Pose class for pose detection
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
}});
// Set the onResultsPose function as the callback for pose detection results
pose.onResults(onResultsPose);

// Create a Camera instance for video input
const camera = new Camera(video5, {
    onFrame: async () => {
        await pose.send({image: video5});
    },
    width: 640,
    height: 480
});

// Start capturing video from the camera
camera.start();

// Create a ControlPanel with various options for pose detection
new ControlPanel(controlsElement5, {
    selfieMode: true,
    upperBodyOnly: false,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})
    .add([
        new StaticText({title: 'MediaPipe Pose'}),
        fpsControl,
        new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
        new Toggle({title: 'Upper-body Only', field: 'upperBodyOnly'}),
        new Toggle({title: 'Smooth Landmarks', field: 'smoothLandmarks'}),
        new Slider({
            title: 'Min Detection Confidence',
            field: 'minDetectionConfidence',
            range: [0, 1],
            step: 0.01
        }),
        new Slider({
            title: 'Min Tracking Confidence',
            field: 'minTrackingConfidence',
            range: [0, 1],
            step: 0.01
        }),
    ])
    .on(options => {
        video5.classList.toggle('selfie', options.selfieMode);
        pose.setOptions(options);
    });

// UI for downloading cached landmarks on demand
document.getElementById('downloadButton').addEventListener('click', saveCachedLandmarks);

function analyseCrossedArms(landmarks) {
    // MediaPipe Pose landmark indices
    const LEFT_ELBOW = 13;
    const RIGHT_ELBOW = 14;
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_WRIST = 15;
    const RIGHT_WRIST = 16;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;

    let crossedArmsDetected = false;

    if (landmarks[LEFT_ELBOW].visibility > 0.5 && landmarks[RIGHT_ELBOW].visibility > 0.5) {
        if (landmarks[LEFT_SHOULDER].x < landmarks[RIGHT_SHOULDER].x) {
            // Check for crossed arms when left shoulder is to the left of the right shoulder
            crossedArmsDetected = areArmsCrossed(landmarks, LEFT_WRIST, RIGHT_WRIST, LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP);
        } else {
            // Check for crossed arms when left shoulder is to the right of the right shoulder
            crossedArmsDetected = areArmsCrossed(landmarks, RIGHT_WRIST, LEFT_WRIST, RIGHT_SHOULDER, LEFT_SHOULDER, RIGHT_HIP, LEFT_HIP);
        }
    }

    return crossedArmsDetected;
}

function areArmsCrossed(landmarks, wrist1, wrist2, shoulder1, shoulder2, hip1, hip2) {
    return landmarks[wrist1].x > landmarks[shoulder1].x &&
           landmarks[wrist2].x < landmarks[shoulder2].x &&
           landmarks[wrist1].y < landmarks[hip1].y &&
           landmarks[wrist1].y > landmarks[shoulder1].y &&
           landmarks[wrist2].y < landmarks[hip2].y &&
           landmarks[wrist2].y > landmarks[shoulder2].y;
}
let poseLandmarks = pose.onResults(onResultsPose);
let crossedArms = analyseCrossedArms(poseLandmarks);
console.log("Crossed Arms Detected:", crossedArms);


function analyseCrossedLegs(landmarks) {
    const LEFT_ANKLE = 27;
    const RIGHT_ANKLE = 28;
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;

    let crossedLegsDetected = false;

    if (landmarks[LEFT_ANKLE].visibility > 0.5 && landmarks[RIGHT_ANKLE].visibility > 0.5) {
        if (landmarks[LEFT_SHOULDER].x < landmarks[RIGHT_SHOULDER].x) {
            if (landmarks[LEFT_ANKLE].x > landmarks[RIGHT_ANKLE].x) {
                crossedLegsDetected = true;
            }
        } else {
            if (landmarks[LEFT_ANKLE].x < landmarks[RIGHT_ANKLE].x) {
                crossedLegsDetected = true;
            }
        }
    }

    return crossedLegsDetected;
}
function analyseNoHands(poseLandmarks) {
    // Define visibility thresholds
    const visibilityThresholdHigh = 0.5; // For hips and shoulders
    const visibilityThresholdLow = 0.7; // For wrists

    // MediaPipe Pose landmark indices for shoulders and hips
    const LEFT_HIP = 23; // Update these indices if necessary based on the actual MediaPipe model
    const RIGHT_SHOULDER = 12;
    const LEFT_WRIST = 15;
    const RIGHT_WRIST = 16;

    // Check visibility for hips and shoulders
    const leftHipVisible = poseLandmarks[LEFT_HIP] && poseLandmarks[LEFT_HIP].visibility > visibilityThresholdHigh;
    const rightShoulderVisible = poseLandmarks[RIGHT_SHOULDER] && poseLandmarks[RIGHT_SHOULDER].visibility > visibilityThresholdHigh;

    // If either the left hip or the right shoulder is not clearly visible, return false early
    if (!leftHipVisible || !rightShoulderVisible) {
        return false; // Not enough visibility to consider "No Hands" condition
    }

    // Check if the visibility of either wrist is below the lower threshold, indicating "No Hands"
    const leftWristVisible = poseLandmarks[LEFT_WRIST] && poseLandmarks[LEFT_WRIST].visibility > visibilityThresholdLow;
    const rightWristVisible = poseLandmarks[RIGHT_WRIST] && poseLandmarks[RIGHT_WRIST].visibility > visibilityThresholdLow;

    // No hands detected if either wrist is not visible enough
    let noHandsDetected = !leftWristVisible || !rightWristVisible;

    return noHandsDetected; // Return true if no hands detected, false otherwise
}

function isPersonTurningSide(poseLandmarks) {
    // MediaPipe Pose landmark indices for shoulders and hips
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;

    // Thresholds for visibility and position differences
    const visibilityThreshold = 0.5;
    const positionDifferenceThreshold = 0.1; // Adjust based on experimentation

    // Check visibility
    const shouldersAndHipsVisible = poseLandmarks[LEFT_SHOULDER].visibility > visibilityThreshold &&
                                    poseLandmarks[RIGHT_SHOULDER].visibility > visibilityThreshold &&
                                    poseLandmarks[LEFT_HIP].visibility > visibilityThreshold &&
                                    poseLandmarks[RIGHT_HIP].visibility > visibilityThreshold;

    if (!shouldersAndHipsVisible) {
        return false; // Not enough information to determine orientation
    }

    // Calculate the differences in x-coordinates between shoulders and hips
    const shoulderDifference = Math.abs(poseLandmarks[LEFT_SHOULDER].x - poseLandmarks[RIGHT_SHOULDER].x);
    const hipDifference = Math.abs(poseLandmarks[LEFT_HIP].x - poseLandmarks[RIGHT_HIP].x);

    // Determine if turning to the side based on the position differences
    return shoulderDifference > positionDifferenceThreshold || hipDifference > positionDifferenceThreshold;
}
function isHandCloseToFace(poseLandmarks) {
    const NOSE = 0;
    const LEFT_WRIST = 15;
    const RIGHT_WRIST = 16;
    const proximityThreshold = 0.2; // Define a suitable threshold based on observation

    let nose = poseLandmarks[NOSE];
    let leftWrist = poseLandmarks[LEFT_WRIST];
    let rightWrist = poseLandmarks[RIGHT_WRIST];

    // Calculate Euclidean distances from the wrists to the nose
    let distanceLeftWristToNose = Math.sqrt(Math.pow(nose.x - leftWrist.x, 2) + Math.pow(nose.y - leftWrist.y, 2));
    let distanceRightWristToNose = Math.sqrt(Math.pow(nose.x - rightWrist.x, 2) + Math.pow(nose.y - rightWrist.y, 2));

    // Check if either hand is close to the face
    return distanceLeftWristToNose < proximityThreshold || distanceRightWristToNose < proximityThreshold;
}
