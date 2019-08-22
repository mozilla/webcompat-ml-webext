const GITHUB_ISSUE_REGEX = "github.com/webcompat/web-bugs/issues/.+";
const NOTIFICATION_ID = "ml-github-webcompat-notification";
const CLASSIFICATION_PROBABILITY_THRESHOLD = 0.8;
const S3_BUCKET_URL =
  "https://webcompat-ml-results.s3.eu-central-1.amazonaws.com";

async function fetchClassificationDetails(url) {
  const issueId = url.split("/").pop();
  const classificationUrl = `${S3_BUCKET_URL}/${issueId}.json`;
  console.log(`Webcompat issue: ${issueId}`);
  console.log(`Classification data URL: ${classificationUrl}`);
  let response = await fetch(classificationUrl);
  let data = await response.json();
  return data;
}

function init(details) {
  fetchClassificationDetails(details.url).then(function(data) {
    console.log(`Classification data: ${JSON.stringify(data)}`);

    if (data[0].probability >= CLASSIFICATION_PROBABILITY_THRESHOLD) {
      const notificationTitle = "WebCompat triaging automation";
      const notificationMsg = `Possible ${classification.label} issue`;

      browser.notifications.create(NOTIFICATION_ID, {
        type: "basic",
        title: notificationTitle,
        message: notificationMsg
      });
    }
  });
}

const isGithubFilter = {
  url: [
    {
      urlMatches: GITHUB_ISSUE_REGEX
    }
  ]
};

browser.webNavigation.onHistoryStateUpdated.addListener(init, isGithubFilter);
