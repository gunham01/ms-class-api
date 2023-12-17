/**
 * @typedef {{
 *  content: string,
 *  contentType: 'text' | 'html'
 * }} ItemBody
 *
 * @typedef {{
 *  id?: string
 *  name?: string
 *  content: string
 *  contentType: 'reference' 
 *    | 'application/vnd.microsoft.card.codesnippet' 
 *    | 'application/vnd.microsoft.card.announcement'
 *  contentUrl?: string
 * }} ChatMessageAttachment
 */

class MSChatMessage {
  /**
   * @type {string}
   */
  id;

  /**
   * @type {ItemBody}
   */
  body;

  /**
   * @type {ChatMessageAttachment}
   */
  attachments;
}

module.exports = {
  MSChatMessage
}
