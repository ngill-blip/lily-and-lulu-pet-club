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
    sheet.appendRow(['id', 'category', 'text', 'date', 'availability']);
    sheet.setFrozenRows(1);
  }

  sheet = ss.getSheetByName('Thoughts');
  if (!sheet) {
    sheet = ss.insertSheet('Thoughts');
    sheet.appendRow(['id', 'category', 'text', 'date', 'availability']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Domain availability check ─────────────────────────────────
// Uses the free RDAP standard — no API key needed.
// HTTP 200 = domain is registered (taken). 404 = likely available.
function checkDomainAvailability_(rawText) {
  var domain = rawText.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '');   // strip http://
  domain = domain.replace(/^www\./i, '');           // strip www.
  domain = domain.split(/[\s\/]+/)[0];              // first word only
  domain = domain.replace(/[^a-z0-9.\-]/g, '');    // clean characters

  if (domain.indexOf('.') === -1) {
    return '⚠️ Include a TLD to check (e.g. lilyandlulu.com)';
  }

  try {
    var resp = UrlFetchApp.fetch('https://rdap.org/domain/' + domain, {
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code === 200) {
      return '❌ Taken — ' + domain;
    } else if (code === 404) {
      return '✅ Available — ' + domain;
    } else {
      return '⚠️ Could not check (code ' + code + ')';
    }
  } catch (e) {
    return '⚠️ Check failed: ' + e.message;
  }
}

// ── Called when the website loads — returns all saved thoughts ──
function doGet(e) {
  var sheet    = getOrCreateSheet_();
  var rows     = sheet.getDataRange().getValues();
  var thoughts = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) {
      thoughts.push({
        id:           String(rows[i][0]),
        cat:          rows[i][1],
        text:         rows[i][2],
        date:         rows[i][3],
        availability: rows[i][4] || ''
      });
    }
  }
  thoughts.reverse();

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, thoughts: thoughts }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Called when a thought is added or deleted ──
function doPost(e) {
  var body  = JSON.parse(e.postData.contents);
  var sheet = getOrCreateSheet_();

  if (body.action === 'add') {
    var availability = '';
    if (body.cat === '🌐 Domain Names') {
      availability = checkDomainAvailability_(body.text);
    }
    sheet.appendRow([body.id, body.cat, body.text, body.date, availability]);

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
