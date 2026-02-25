/**
 * Squarespace → Headword CRM Bridge
 * -----------------------------------
 * Watches the Google Sheet connected to the Lightfold contact form.
 * When Squarespace inserts a new row, this script POSTs the data to
 * the CRM API (POST /clients/contact) to create a client record.
 *
 * SETUP (one-time):
 * 1. In the Apps Script editor, go to Project Settings (gear icon)
 *    → Script Properties → Add property:
 *      Name:  CRM_API_SECRET
 *      Value: (copy CONTACT_FORM_SECRET from backend/.env)
 *
 * 2. Also add:
 *      Name:  CRM_API_URL
 *      Value: https://your-deployed-api.com/clients/contact
 *             (or http://localhost:3001/clients/contact for local testing)
 *
 * 3. Set up the trigger:
 *    - Triggers (alarm clock icon) → Add Trigger
 *    - Function: sendToCRM
 *    - Event source: From spreadsheet
 *    - Event type: On change
 *    - Save and grant permissions
 *
 * EXPECTED SQUARESPACE COLUMN HEADERS (row 1 of the sheet):
 *   "Date", "Name", "Email", "Sign up for news and updates", "Message"
 *   Squarespace concatenates First Name + Last Name into a single "Name" column.
 *   This script splits on the first space: "John Smith" → firstName=John, lastName=Smith.
 *   Since both fields are required on the form, there will always be two names.
 */

// Maps Squarespace sheet column headers → CRM API field names.
// Keys must match the exact header text in your Google Sheet (case-sensitive).
// Note: "Name" is handled separately below via NAME_COLUMN splitting.
var FIELD_MAP = {
  'Email': 'email',
  'Email Address': 'email',       // Squarespace sometimes uses this label instead
  'Message': 'message',
  'Sign up for news and updates': 'newsletter',
};

// The column header Squarespace uses for the combined name field.
var NAME_COLUMN = 'Name';

// Which site this form is on — written into the CRM record as the source/website.
var SITE_SOURCE = 'lightfold.tv';

function sendToCRM(e) {
  // Only fire on newly inserted rows (not edits or other changes).
  if (e.changeType !== 'INSERT_ROW') return;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Read headers from row 1.
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Read the newly added row (always the last row after an insert).
  var lastRow = sheet.getLastRow();
  var rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Build a raw object from headers → values.
  var raw = {};
  for (var i = 0; i < headers.length; i++) {
    if (headers[i]) raw[headers[i]] = rowData[i];
  }

  // Split the combined "Name" column into firstName / lastName.
  // Both are required on the Squarespace form so there will always be two parts.
  var payload = { source: SITE_SOURCE };
  var fullName = String(raw[NAME_COLUMN] || '').trim();
  if (fullName) {
    var spaceIndex = fullName.indexOf(' ');
    if (spaceIndex !== -1) {
      payload.firstName = fullName.substring(0, spaceIndex).trim();
      payload.lastName  = fullName.substring(spaceIndex + 1).trim();
    } else {
      // Only one name present (shouldn't happen since form requires both).
      payload.firstName = fullName;
    }
  }

  // Map remaining fields (email, message, newsletter).
  for (var header in FIELD_MAP) {
    if (raw[header] !== undefined && raw[header] !== '') {
      var apiField = FIELD_MAP[header];
      if (apiField === 'newsletter') {
        // Checkbox comes through as TRUE/FALSE boolean or 'true'/'false' string.
        payload[apiField] = (raw[header] === true || String(raw[header]).toLowerCase() === 'true');
      } else {
        payload[apiField] = String(raw[header]).trim();
      }
    }
  }

  // Bail out if the minimum required fields aren't present.
  if (!payload.firstName || !payload.email) {
    Logger.log('Skipping row — missing firstName or email. Row data: ' + JSON.stringify(raw));
    return;
  }

  // Pull secret and URL from Script Properties (never hardcode these).
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('CRM_API_SECRET');
  var apiUrl = props.getProperty('CRM_API_URL');

  if (!secret || !apiUrl) {
    Logger.log('ERROR: CRM_API_SECRET or CRM_API_URL not set in Script Properties.');
    return;
  }

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-Api-Secret': secret,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true, // Don't throw on 4xx/5xx — log instead.
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var code = response.getResponseCode();
    var body = response.getContentText();

    if (code === 201) {
      Logger.log('SUCCESS: Client created. Response: ' + body);
    } else {
      Logger.log('WARNING: CRM returned status ' + code + '. Body: ' + body);
      // If email already exists (duplicate), that's expected — not an error.
      if (body.indexOf('already exists') !== -1) {
        Logger.log('Duplicate email — record already in CRM, no action needed.');
      }
    }
  } catch (err) {
    Logger.log('ERROR sending to CRM: ' + err.toString());
  }
}
