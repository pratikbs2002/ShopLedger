// Date utilities for ShopLedger (Indian DD/MM/YYYY format)

function pad2(n) {
  return ('0' + n).slice(-2);
}

exports.today = function () {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
};

// Added for date-picker filtering (Vikram, Oct 2021)
// Accepts DD/MM/YYYY or YYYY-MM-DD and returns a calendar-ordered key
exports.normalizeDateKey = function (str) {
  var s = String(str || '').trim();
  var parts = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (parts) return parts[3] + '-' + pad2(parts[2]) + '-' + pad2(parts[1]);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
};

exports.getFiscalYear = function (dateStr) {
  var s = exports.normalizeDateKey(dateStr);
  var parts = s.split('-');
  if (parts.length !== 3) return 'FY21-22';
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);
  if (month >= 4) {
    return 'FY' + String(year).slice(-2) + '-' + String(year + 1).slice(-2);
  }
  return 'FY' + String(year - 1).slice(-2) + '-' + String(year).slice(-2);
};
