const { WebClient } = require('@slack/web-api');
const core = require('@actions/core');
const FormData = require('form-data');
const fs = require('fs');
const { STATUS_CODES } = require('http');

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
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(file));
    form.append('filetype', 'auto');

    const response = await fetch('https://slack.com/api/files.upload', {
      body: form,
      method: 'POST'
    });

    const body = await response.json();

    if (response.status === STATUS_CODES.ok) {
      return body.file.url_private;
    } else {
      return body.error;
    }
  } catch (error) {
    console.error(`Error uploading files to slack ${file}:`, error.stack);
    throw error;
  }
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
