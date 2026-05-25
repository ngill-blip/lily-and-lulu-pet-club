// ============================================================
//  🐾 Lily & Lulu Pet Club — Thoughts Log Backend
//  Paste this entire file into Google Apps Script, then
//  deploy it as a Web App (instructions in the guide).
// ============================================================

function getOrCreateSheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty('SS_ID');
  var ss, sheet;

  if (ssId) {
    ss = SpreadsheetApp.openById(ssId);
  } else {
    ss    = SpreadsheetApp.create('🐾 Lily & Lulu — Thoughts Log');
    ssId  = ss.getId();
    props.setProperty('SS_ID', ssId);
    sheet = ss.getActiveSheet();
    sheet.setName('Thoughts');
    sheet.appendRow(['id', 'category', 'text', 'date']);
    sheet.setFrozenRows(1);
  }

  sheet = ss.getSheetByName('Thoughts');
  if (!sheet) {
    sheet = ss.insertSheet('Thoughts');
    sheet.appendRow(['id', 'category', 'text', 'date']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Called when the website loads — returns all saved thoughts
function doGet(e) {
  var sheet   = getOrCreateSheet_();
  var rows    = sheet.getDataRange().getValues();
  var thoughts = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) {
      thoughts.push({
        id:   String(rows[i][0]),
        cat:  rows[i][1],
        text: rows[i][2],
        date: rows[i][3]
      });
    }
  }
  thoughts.reverse();

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, thoughts: thoughts }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Called when a thought is added or deleted
function doPost(e) {
  var body  = JSON.parse(e.postData.contents);
  var sheet = getOrCreateSheet_();

  if (body.action === 'add') {
    sheet.appendRow([body.id, body.cat, body.text, body.date]);

  } else if (body.action === 'delete') {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(body.id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
