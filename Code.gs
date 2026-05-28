// ============================================================
//  🐾 Lily & Lulu Pet Club — Thoughts Log Backend
//  Paste this entire file into Google Apps Script, then
//  deploy it as a Web App (instructions in the guide).
// ============================================================

// ⚠️  IMPORTANT — MASTERLIST PROTECTION ⚠️
// The Google Sheet (stored in Script Properties as 'SS_ID') is the
// permanent masterlist of all thoughts and domain checks.
// NEVER delete or replace this spreadsheet.
// This function ONLY creates the sheet if it does not already exist —
// it will NEVER overwrite, clear, or delete any existing data.
// If you need to update the script: deploy a new version, do NOT
// change the SS_ID property or delete the 'Thoughts' sheet.
function getOrCreateSheet_() {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty('SS_ID');
  var ss, sheet;

  if (ssId) {
    // ✅ Masterlist spreadsheet already exists — open it safely
    ss = SpreadsheetApp.openById(ssId);
  } else {
    // First-run only: create the spreadsheet once and store its ID
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
    // Safety net: if the tab was accidentally deleted, recreate it
    // (the spreadsheet itself and all other data are untouched)
    sheet = ss.insertSheet('Thoughts');
    sheet.appendRow(['id', 'category', 'text', 'date', 'availability']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Domain availability check ─────────────────────────────────
// Uses the free RDAP standard — no API key needed.
// If no TLD is given, automatically tries .com .net .org .co .pet
function checkOneDomain_(domain) {
  try {
    var resp = UrlFetchApp.fetch('https://rdap.org/domain/' + domain, {
      muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code === 200) return '❌ ' + domain;
    if (code === 404) return '✅ ' + domain;
    return '⚠️ ' + domain;
  } catch (e) {
    return '⚠️ ' + domain;
  }
}

function checkDomainAvailability_(rawText) {
  // Extract first word-like token, strip URL parts
  var base = rawText.trim().toLowerCase();
  base = base.replace(/^https?:\/\//i, '');
  base = base.replace(/^www\./i, '');
  base = base.split(/[\s,\/]+/)[0];          // first word before space or comma
  base = base.replace(/[^a-z0-9.\-]/g, '');

  // If it already has a TLD (contains a dot), check just that one
  if (base.indexOf('.') !== -1) {
    return checkOneDomain_(base);
  }

  // No TLD — automatically check the most common ones
  var tlds = ['.com', '.net', '.org', '.co', '.pet'];
  var results = [];
  for (var i = 0; i < tlds.length; i++) {
    results.push(checkOneDomain_(base + tlds[i]));
  }
  return results.join('  |  ');
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
