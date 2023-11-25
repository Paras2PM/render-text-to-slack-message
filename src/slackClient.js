const { WebClient } = require('@slack/web-api');
const core = require('@actions/core');

const slackToken = process.env.SLACK_API_TOKEN || '';
const client = new WebClient(slackToken);
const channelId = core.getInput('channel-id');
const emailDomain = core.getInput('email-domain');

async function callSlackApi (apiCallPromise, log) {
  try {
    const response = await apiCallPromise;
    if (!response.ok) {
      throw new Error(`Slack Error: ${response.error}`);
    }
    return response;
  } catch (error) {
    console.error(log, error.stack);
    throw error;
  }
}

exports.postFilesUpload = async function (file) {
  const response = await callSlackApi(
    client.files.upload({ file }),
    `Error uploading files to slack ${file}:`
  );
  return response.file.url_private;
};

exports.getUserIdByEmail = async function (username) {
  if (!emailDomain) {
    throw new Error('email-domain is not provided.');
  }
  const response = await callSlackApi(
    client.users.lookupByEmail({ email: `${username}${emailDomain}` }),
    `Error looking up user ID for ${username}:`
  );
  return response.user.id;
};

exports.postChatPostMessage = async function (payload) {
  if (!channelId) {
    throw new Error('channel-id is not provided.');
  }
  await callSlackApi(
    client.chat.postMessage({ channel: channelId, blocks: payload }),
    'Error posting message to channel:'
  );
};
