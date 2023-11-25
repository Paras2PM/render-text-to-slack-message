const core = require('@actions/core');
const { inputTextPreprocess, inputTextPostprocess } = require('./renderText');
const { fetchCorrectImageUrl, replaceMentionsWithMemberId, postSlackMessage } = require('./slackClientService');

const inputText = core.getInput('input-text');
const startBoundary = core.getInput('start-boundary');
const endBoundary = core.getInput('end-boundary');

exports.run = async function () {
  try {
    const { body, imageUrls } = inputTextPreprocess(inputText, startBoundary, endBoundary);

    const correctImageUrlsPromise = fetchCorrectImageUrl(imageUrls);
    const addMentionsToBodyPromise = replaceMentionsWithMemberId(body);

    const [correctImageUrls, addMentionsToBody] = await Promise.all(correctImageUrlsPromise, addMentionsToBodyPromise);

    const payload = inputTextPostprocess(addMentionsToBody, correctImageUrls);
    console.log(`The event payload: ${payload}`);
    postSlackMessage(payload);
  } catch (error) {
    core.setFailed(error);
  }
};
