const { inputTextPreprocess, inputTextPostprocess } = require('../src/renderText');

describe('inputTextPreprocess', () => {
  const cases = [
    ['START_TAG', 'END_TAG', 'text\n More text', ['image1.jpg']],
    [undefined, undefined, 'Some START_TAG text\n More text\n END_TAG some more text', ['image1.jpg', 'image2.jpg']],
    ['START_TAG', undefined, 'text\n More text\n END_TAG some more text', ['image1.jpg', 'image2.jpg']],
    [undefined, 'END_TAG', 'Some START_TAG text\n More text', ['image1.jpg']]
  ];

  test.each(cases)('handles valid input text with img urls, %s - %s start/end boundry', (
    startBoundary, endBoundary, expectedInputText, expectedImgUrls
  ) => {
    const inputText = 'Some START_TAG text\n<img src="image1.jpg"> More text\n END_TAG<img src="image2.jpg"> some more text';
    const { body, imageUrls } = inputTextPreprocess(inputText, startBoundary, endBoundary);
    expect(body).toEqual(expectedInputText);
    expect(imageUrls).toEqual(expectedImgUrls);

    expect(inputTextPreprocess).not.toThrow('The input text is empty');
  });

  test('handles empty input text', () => {
    function emptyInputText () {
      const inputText = '';
      const startBoundary = 'START_TAG';
      const endBoundary = 'END_TAG';

      inputTextPreprocess(inputText, startBoundary, endBoundary);
    }
    expect(emptyInputText).toThrow(new Error('The input text is empty'));
  });
});

describe('inputTextPostprocess', () => {
  const cases = [
    ['some text in here with some mentioned @123 id', ['image1.jpg', 'image2.jpg', 'image3.jpg'],
      [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'some text in here with some mentioned @123 id'
        }
      },
      {
        type: 'image',
        image_url: 'image1.jpg',
        alt_text: 'some_image'
      },
      {
        type: 'image',
        image_url: 'image2.jpg',
        alt_text: 'some_image'
      },
      {
        type: 'image',
        image_url: 'image3.jpg',
        alt_text: 'some_image'
      }]
    ],
    ['some text\n this is a new line of text', [],
      [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'some text\n this is a new line of text'
        }
      }]
    ],
    ['', ['image.jpg'],
      [{
        type: 'image',
        image_url: 'image.jpg',
        alt_text: 'some_image'
      }]
    ]
  ];

  test.each(cases)('handles body (%s) - image_urls (%o) passed and returns json payload', (
    body, imageUrls, expectedPayload
  ) => {
    const payload = inputTextPostprocess(body, imageUrls);
    expect(payload).toEqual(JSON.stringify(expectedPayload));
  });

  test('handle cases where both body and image urls are empty', () => {
    function emptyBodyAndImageUrls () {
      const body = '';
      const imageUrls = [];
      inputTextPostprocess(body, imageUrls);
    }
    expect(emptyBodyAndImageUrls).toThrow(new Error('The body and image urls are both empty'));
  });
});
