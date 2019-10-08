const PROBABILITY_THRESHOLD = 0.9;
const S3_BUCKET_URL =
  "https://webcompat-ml-results.s3.eu-central-1.amazonaws.com/needsdiagnosis";

var messagePort;

async function fetchClassificationDetails(url) {
  const issueId = new URL(url).pathname.split("/").pop();
  const classificationUrl = `${S3_BUCKET_URL}/${issueId}.json`;
  console.log(`Webcompat issue: ${issueId}`);
  console.log(`Classification data URL: ${classificationUrl}`);
  const response = await fetch(classificationUrl);
  const data = await response.json();
  return data;
}

function getNeedsDiagnosisThreshold(prediction) {
  console.log("Get probability threshold");
  if (prediction["needsdiagnosis"][0] === false) {
    if (prediction["proba_False"][0] >= PROBABILITY_THRESHOLD) {
      return false;
    }
  }
}

function handleMessage(msg) {
  fetchClassificationDetails(msg.url)
    .then(function(data) {
      console.log(`Classification data: ${JSON.stringify(data)}`);
      const classification = getNeedsDiagnosisThreshold(data);

      if (classification === false) {
        const notificationTitle = "WebCompat triaging automation";
        const notificationMsg = "Issue doesn't need diagnosis";
        const response = { title: notificationTitle, msg: notificationMsg };
        messagePort.postMessage(response);
      }
    })
    .catch(function(error) {
      console.log(`Couldn't fetch classification data: ${error}`);
    });
}

function connected(port) {
  messagePort = port;
  messagePort.onMessage.addListener(function(msg) {
    console.log("In background script, received message from content script");
    console.log(`Message: ${JSON.stringify(msg)}`);
    handleMessage(msg);
  });
}

browser.runtime.onConnect.addListener(connected);
