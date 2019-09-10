const GITHUB_ISSUE_REGEX = "github.com/webcompat/web-bugs/issues/.+";
const NOTIFICATION_ID = "ml-github-webcompat-notification";
const S3_BUCKET_URL =
  "https://webcompat-ml-results.s3.eu-central-1.amazonaws.com";

async function fetchClassificationDetails(url) {
  const issueId = new URL(url).pathname.split("/").pop();
  const classificationUrl = `${S3_BUCKET_URL}/${issueId}.json`;
  console.log(`Webcompat issue: ${issueId}`);
  console.log(`Classification data URL: ${classificationUrl}`);
  const response = await fetch(classificationUrl);
  const data = await response.json();
  return data;
}

function init(details) {
  fetchClassificationDetails(details.url)
    .then(function(data) {
      console.log(`Classification data: ${JSON.stringify(data)}`);

      const classification = data.probability < 0.5 ? "valid" : "invalid";
      const notificationTitle = "WebCompat triaging automation";
      const notificationMsg = `Possible ${classification} issue`;

      browser.notifications.create(NOTIFICATION_ID, {
        type: "basic",
        title: notificationTitle,
        message: notificationMsg
      });
    })
    .catch(function(error) {
      console.log(`Couldn't fetch classification data: ${error}`);
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
