const { WebClient } = require('@slack/web-api');
const core = require('@actions/core');
const FormData = require('form-data');
const fs = require('fs');
const { STATUS_CODES } = require('http');

const slackBotToken = process.env.SLACK_BOT_TOKEN || '';
const slackUserToken = process.env.SLACK_USER_TOKEN || '';

const botClient = new WebClient(slackBotToken);
const userClient = new WebClient(slackUserToken);
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

async function filesSharePubliceUrl (fileId) {
  await callSlackApi(
    userClient.files.sharedPublicURL({ file: fileId }),
    'Error uploading file for public/external sharing:'
  );
}

exports.postFilesUpload = async function (file) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(file));
    form.append('filetype', 'auto');

    const response = await fetch('https://slack.com/api/files.upload', {
      body: form,
      method: 'POST',
      headers: { Authorization: `Bearer ${slackUserToken}` }
    });

    const body = await response.json();
    console.log(body);

    if (response.status === STATUS_CODES.ok) {
      await filesSharePubliceUrl(body.file.id);
      const match = body.file.permalink_public.match(/.*-(.*)$/);
      const pubSecret = match ? match[1] : '';
      const fileUrl = `${body.file.url_private}?pub_secret=${pubSecret}`;
      return fileUrl;
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
    botClient.users.lookupByEmail({ email: `${username}${emailDomain}` }),
    `Error looking up user ID for ${username}:`
  );
  return response.user.id;
};

exports.postChatPostMessage = async function (payload) {
  if (!channelId) {
    throw new Error('channel-id is not provided.');
  }
  await callSlackApi(
    botClient.chat.postMessage({ channel: channelId, blocks: payload }),
    'Error posting message to channel:'
  );
};
