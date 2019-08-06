const NOTIFICATION_ID = "ml-github-webcompat-notification";
const CLASSIFICATION_PROBABILITY_THRESHOLD = 0.8;

function fetchClassificationDetails() {
  // TODO fetch actual classification data

  const classification = {
    label: "invalid",
    probability: 0.9
  };

  return classification;
}

function init(details) {
  const classification = fetchClassificationDetails();

  if (classification.probability >= CLASSIFICATION_PROBABILITY_THRESHOLD) {
    const notificationTitle = "WebCompat triaging automation";
    const notificationMsg = `Possible ${classification.label} issue`;

    browser.notifications.create(NOTIFICATION_ID, {
      type: "basic",
      title: notificationTitle,
      message: notificationMsg
    });
  }
}

const isGithubFilter = {
  url: [
    {
      hostContains: ".github.com"
    }
  ]
};

browser.webNavigation.onCommitted.addListener(init, isGithubFilter);
