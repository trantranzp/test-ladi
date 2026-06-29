/**
 * Apps Script Web App that receives lead submissions from the LUKE landing
 * page (site/script.js), appends them to the "Leads" sheet, and forwards a
 * Telegram notification. Deploy this bound to the target spreadsheet so it
 * can resolve the active spreadsheet without needing an ID.
 *
 * Deployment (one-time, done in the Google Sheets UI — see README in this
 * folder for the full walkthrough):
 *   Extensions > Apps Script > paste this file > Deploy > New deployment
 *   > Web app > Execute as: Me > Who has access: Anyone > Deploy
 *   Copy the resulting /exec URL into GOOGLE_SCRIPT_URL in site/script.js
 */

var TELEGRAM_BOT_TOKEN = '6295828710:AAEKMAsRUVXQiw8ZSyaprxcsIGrQLk1MjJg';
var TELEGRAM_CHAT_ID = '-1003223690049';
var SHEET_NAME = 'Leads';

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  appendLead(data);
  notifyTelegram(data);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendLead(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Thời gian', 'Nguồn', 'Họ tên', 'SĐT', 'Cây trồng', 'Combo', 'URL nguồn', 'Địa chỉ IP']);
  }
  sheet.appendRow([
    new Date(),
    data.source || '',
    data.name || '',
    data.phone || '',
    data.crop || '',
    data.combo || '',
    data.page_url || '',
    data.ip || ''
  ]);
}

function notifyTelegram(data) {
  var lines = [
    '🌱 Lead mới — LUKE Landing Page',
    'Nguồn: ' + (data.source || '(không rõ)'),
    'Họ tên: ' + (data.name || '(chưa nhập)'),
    'SĐT: ' + (data.phone || '(chưa nhập)')
  ];
  if (data.crop) lines.push('Cây trồng: ' + data.crop);
  if (data.combo) lines.push('Combo: ' + data.combo);
  if (data.page_url) lines.push('Nguồn từ: ' + data.page_url);
  if (data.ip) lines.push('Địa chỉ IP: ' + data.ip);

  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  var payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: lines.join('\n')
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
