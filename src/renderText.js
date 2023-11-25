function trimTextByBoundaries (inputText, startBoundary, endBoundary) {
  const hasStartBoundary = startBoundary !== undefined;
  const hasEndBoundary = endBoundary !== undefined;

  if (!hasStartBoundary && !hasEndBoundary) {
    return inputText;
  }

  let startIndex = hasStartBoundary ? inputText.indexOf(startBoundary) : 0;
  if (startIndex === -1) {
    startIndex = 0;
  }

  const endIndex = hasEndBoundary ? inputText.indexOf(endBoundary, startIndex + (hasStartBoundary ? startBoundary.length : 0)) : inputText.length;
  if (endIndex === -1 || startIndex >= endIndex) {
    return inputText.substring(0, inputText.length).trim();
  }

  return inputText.substring(startIndex + (hasStartBoundary ? startBoundary.length : 0), endIndex).trim();
}

function extractAndRemoveImageTags (trimmedText) {
  const imgTagRegex = /<img.*?src=["'](.*?)["'][^>]*>/g;

  const imageUrls = [];
  let body = trimmedText.replace(imgTagRegex, (match, imageUrl) => {
    imageUrls.push(imageUrl);
    return '';
  });

  // github and normal markdown have double astrik for bold text but oddly slack just use one.
  body = body.replace(/\*\*/g, '*');

  return { body, imageUrls };
}

exports.inputTextPreprocess = function (inputText, startBoundary, endBoundary) {
  if (inputText.length === 0) {
    throw new Error('The input text is empty');
  }
  const trimmedText = trimTextByBoundaries(inputText, startBoundary, endBoundary);
  return extractAndRemoveImageTags(trimmedText);
};

exports.inputTextPostprocess = function (body, imageUrls) {
  // this shouldn't happen but you never know
  if (body.length === 0 && imageUrls.length === 0) {
    throw new Error('The body and image urls are both empty');
  }

  const jsonObject = [];
  // User might only have image urls in it's input text,
  // in this case we no longer need to have this section block.
  if (body.length !== 0) {
    // Create the JSON object with the desired format
    jsonObject.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: body
        }
      });
  }

  // Add image blocks to the JSON object
  for (const imageUrl of imageUrls) {
    jsonObject.push({
      type: 'image',
      image_url: imageUrl,
      alt_text: 'some_image'
    });
  }

  return JSON.stringify(jsonObject);
};
