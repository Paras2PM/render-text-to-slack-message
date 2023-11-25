const { postFilesUpload, getUserIdByEmail, postChatPostMessage } = require('./slackClient');

exports.fetchCorrectImageUrl = async function (imageUrls) {
  const correctImageUrls = [];

  for (const imageUrl of imageUrls) {
    const uploadedImageUrl = await postFilesUpload(imageUrl);
    correctImageUrls.push(uploadedImageUrl);
  }
  return correctImageUrls;
};

exports.replaceMentionsWithMemberId = async function (plainText) {
  let modifiedText = plainText;
  const mentionRegex = /@([^\s])+/g;
  const mentions = plainText.match(mentionRegex) || [];

  const userIdPromises = mentions.map(async (mention) => {
    const username = mention.substring(1);
    try {
      const userIdPromise = await getUserIdByEmail(username);
      return { mention, userId: userIdPromise };
    } catch (error) {
      return { mention, userId: null };
    }
  });

  const userIds = await Promise.all(userIdPromises);
  userIds.forEach(({ mention, userId }) => {
    if (userId) {
      modifiedText = modifiedText.replace(mention, `<@${userId}>`);
    }
  });

  return modifiedText;
};

exports.postSlackMessage = function (payload) {
  return postChatPostMessage(payload);
};
