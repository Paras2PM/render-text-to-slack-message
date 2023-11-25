# Render Text to Slack Message

This GitHub Action simplifies the process of posting messages to a Slack channel from your GitHub Actions job. Whether you create a new Slack app or use an existing one, the action utilizes Slack API methods (chat.postMessage, files.upload, and users.lookupByEmail) to instantly share messages without the need for complex Slack workflows. It's designed to convert a pure text into a Slack message using the Slack Block Kit for straightforward and efficient communication.

## Usage
To utilize this action:
- Specify the `input-text`: To send a portion of the input text (e.g., a segment of the PR body), use `start-boundary` and `end-boundary` to trim it.
- The input text will be processed further, correcting image URLs or mentions, and then sent to Slack to ensure that images or mentions work effectively. To enable the mentions functionality, provide the `email-domain` so that the action can fetch the user member ID.
- To send the input text, provide the `channel-id`.
 
For the functionality described above, specific permissions must be granted to the action. Check the following links for the required tokens:

- Get image URLs: [files.upload](https://api.slack.com/methods/files.upload)
- Get user IDs: [users.lookupByEmail](https://api.slack.com/methods/users.lookupByEmail)
- Post message: [chat.postMessage](https://api.slack.com/methods/chat.postMessage)


## Example Usage
To send a message to a Slack channel, create a workflow file in your repository that uses this action. For instance, you can create a file named `.github/workflows/slack.yml` with the following content:

```
- name: Send message to Slack
env:
    SLACK_API_TOKEN: ${{ secrets.SLACK_API_TOKEN }}
uses: Paras2PM/render-text-to-slack-message@v1
with:
    input-text: ${{ github.event.pull_request.body }}
    start-boundary: "START"
    end-boundary: "END"
    email-domain: "@gmail.com"
    channel-id: "C066CL91QUT"
```

For the `SLACK_API_TOKEN`, copy the app's Bot Token from the OAuth & Permissions page and [add it as a secret in your repo settings](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) named `SLACK_API_TOKEN`.

## Inputs

- **`input-text`**: 
  
  **Required** The text to be rendered to be posted as slack message.
- **`start-boundary`**:
  
  Determine where to start triming input text.
- **`end-boundary`**:

  Determine where to end triming input text.
- **`email-domain`**:

  To find correct user to be mentioned in slack, fetching member_id in Slack by looking up from email address (Be discreet with it).
- **`channel-id`**:
  
  **Required** slack channel-id to post message to it.


## Output
- **`time`**:
  
  The time message sent to slack



