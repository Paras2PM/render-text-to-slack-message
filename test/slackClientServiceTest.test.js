jest.mock('../src/slackClient');

const { postFilesUpload, getUserIdByEmail, postChatPostMessage } = require('../src/slackClient');
const { fetchCorrectImageUrl, replaceMentionsWithMemberId, postSlackMessage } = require('../src/slackClientService');

describe('fetchCorrectImageUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches correct image URLs', async () => {
    const mockedPostFilesUpload = postFilesUpload.mockResolvedValue('mocked-uploaded-url');

    const imageUrls = ['image-url-1', 'image-url-2'];
    const result = await fetchCorrectImageUrl(imageUrls);

    expect(result).toEqual(['mocked-uploaded-url', 'mocked-uploaded-url']);
    expect(mockedPostFilesUpload).toHaveBeenCalledTimes(2);
    expect(mockedPostFilesUpload).toHaveBeenNthCalledWith(1, 'image-url-1');
    expect(mockedPostFilesUpload).toHaveBeenNthCalledWith(2, 'image-url-2');
  });

  test('returns an empty array if no image URLs are provided', async () => {
    const mockedPostFilesUpload = postFilesUpload.mockResolvedValue('mocked-uploaded-url');

    const result = await fetchCorrectImageUrl([]);

    expect(result).toEqual([]);
    expect(mockedPostFilesUpload).not.toHaveBeenCalled(); // Ensure files.upload is not called
  });

  test('throws an error if file upload fails', () => {
    const mockedPostFilesUpload = postFilesUpload.mockRejectedValue(new Error('mocked_slack_error'));

    function throwErrorPostFilesUpload () {
      const imageUrls = ['image-url-1', 'image-url-2'];
      return fetchCorrectImageUrl(imageUrls);
    }

    expect(throwErrorPostFilesUpload).rejects.toThrow(new Error('mocked_slack_error'));
    expect(mockedPostFilesUpload).toHaveBeenCalledTimes(1);
    expect(mockedPostFilesUpload).toHaveBeenNthCalledWith(1, 'image-url-1');
    expect(mockedPostFilesUpload).not.toHaveBeenCalledWith('image-url-2');
  });
});

describe('replaceMentionsWithMemberId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('text with mentions in it', async () => {
    const mockedGetUserId = getUserIdByEmail.mockResolvedValue('mocked_user_id');

    const plainText = 'some text and some additional info. cc: @fn1.ln1 and @fn2.ln2';
    const result = await replaceMentionsWithMemberId(plainText);

    expect(result).toEqual('some text and some additional info. cc: <@mocked_user_id> and <@mocked_user_id>');
    expect(mockedGetUserId).toHaveBeenCalledTimes(2);
    expect(mockedGetUserId).toHaveBeenNthCalledWith(1, 'fn1.ln1');
    expect(mockedGetUserId).toHaveBeenNthCalledWith(2, 'fn2.ln2');
  });

  test('text with no mentions in it', async () => {
    const plainText = 'some text and some additional info. cc: fn1.ln1 and fn2.ln2';
    const result = await replaceMentionsWithMemberId(plainText);

    expect(result).toEqual(plainText);
    expect(getUserIdByEmail).toHaveBeenCalledTimes(0);
    expect(getUserIdByEmail).not.toHaveBeenCalledWith('fn1.ln1');
    expect(getUserIdByEmail).not.toHaveBeenCalledWith('fn2.ln2');
  });

  test('no error throws if get user_id fails', async () => {
    const mockedGetUserIdFailed = getUserIdByEmail.mockRejectedValueOnce(new Error('mocked_slack_error'));
    const mockedGetUserId = getUserIdByEmail.mockResolvedValue('mocked_user_id');

    const plainText = 'some text and some additional info. cc: @fn1.ln1 and @fn2.ln2';
    const result = await replaceMentionsWithMemberId(plainText);

    expect(result).toEqual('some text and some additional info. cc: @fn1.ln1 and <@mocked_user_id>');
    expect(mockedGetUserIdFailed).toHaveBeenCalledWith('fn1.ln1');
    expect(mockedGetUserId).toHaveBeenCalledWith('fn2.ln2');
  });
});

describe('postSlackMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('have payload pass to the post message', () => {
    const payload = '[{"type": "section","text": {"type": "mrkdwn","text": "some text"}}]';
    postSlackMessage(payload);
    expect(postChatPostMessage).toHaveBeenCalledTimes(1);
    expect(postChatPostMessage).toHaveBeenCalledWith(payload);
  });

  test('throws an error if post message fails', () => {
    const mockedPostMessage = postChatPostMessage.mockRejectedValue(new Error('mocked_slack_error'));
    const payload = '[{"type": "section","text": {"type": "mrkdwn","text": "some text"}}]';

    expect(() => postSlackMessage(payload)).rejects.toThrow(new Error('mocked_slack_error'));
    expect(mockedPostMessage).toHaveBeenCalledTimes(1);
    expect(mockedPostMessage).toHaveBeenCalledWith(payload);
  });
});
