const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function figures({ subtotal, discount, tax, cgst, sgst, total }) {
  return { subtotal, discount, tax, cgst, sgst, total };
}

test('#1001 uses the 5% and 12% HSN slabs when gstRate is unset', () => {
  const items = [
    { name: 'Rice', hsn: '1006', price: 200, qty: 2, gstRate: undefined },
    { name: 'Ghee', hsn: '0405', price: 300, qty: 1, gstRate: undefined }
  ];
  const coupon = '';
  const printed = invoice.computeInvoiceFigures({ id: 1001, items, coupon });
  const billed = pricing.computeTotals(items, coupon);

  assert.deepEqual(figures(printed), {
    subtotal: 700, discount: 0, tax: 56, cgst: 28, sgst: 28, total: 756
  });
  assert.deepEqual(printed.rows.map(({ gstPercent, lineTax }) => [gstPercent, lineTax]), [
    [5, 20], [12, 36]
  ]);
  assert.deepEqual(figures(billed), {
    subtotal: 700, discount: 0, tax: 56, cgst: 28, sgst: 28, total: 756
  });
  assert.deepEqual(billed.lines.map(({ gstPercent, tax }) => [gstPercent, tax]), [
    [5, 20], [12, 36]
  ]);
});

test('#1002 applies SAVE10 before GST with the same final total', () => {
  const items = [{ name: 'Rice', hsn: '1006', price: 300, qty: 2, gstRate: 5 }];
  const coupon = 'SAVE10';
  const printed = invoice.computeInvoiceFigures({ id: 1002, items, coupon });
  const billed = pricing.computeTotals(items, coupon);

  assert.deepEqual(figures(printed), {
    subtotal: 600, discount: 60, tax: 27, cgst: 13.5, sgst: 13.5, total: 567
  });
  assert.deepEqual(figures(billed), {
    subtotal: 600, discount: 60, tax: 27, cgst: 13.5, sgst: 13.5, total: 567
  });
});

test('#1004 applies the SAVE10 cap on a 2240 subtotal', () => {
  const items = [{ name: 'Tea', hsn: '0902', price: 560, qty: 4, gstRate: 18 }];
  const coupon = 'SAVE10';
  const printed = invoice.computeInvoiceFigures({ id: 1004, items, coupon });
  const billed = pricing.computeTotals(items, coupon);

  assert.deepEqual(figures(printed), {
    subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2
  });
  assert.deepEqual(figures(billed), {
    subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2
  });
});

test('#1008 all-18% invoice matches billing without a coupon', () => {
  const items = [
    { name: 'Tea', hsn: '0902', price: 125, qty: 2, gstRate: undefined },
    { name: 'Coffee', hsn: '0901', price: 125, qty: 1, gstRate: undefined }
  ];
  const coupon = '';
  const printed = invoice.computeInvoiceFigures({ id: 1008, items, coupon });
  const billed = pricing.computeTotals(items, coupon);

  assert.deepEqual(figures(printed), {
    subtotal: 375, discount: 0, tax: 67.5, cgst: 33.75, sgst: 33.75, total: 442.5
  });
  assert.deepEqual(printed.rows.map(({ gstPercent, lineTax }) => [gstPercent, lineTax]), [
    [18, 45], [18, 22.5]
  ]);
  assert.deepEqual(figures(billed), figures(printed));
});
test('invoice matches checkout line GST and totals with mixed HSN slabs and capped SAVE10', () => {
  const items = [
    { name: 'Rice', hsn: '1006', price: 560, qty: 2 },
    { name: 'Ghee', hsn: '0405', price: 1120, qty: 1 }
  ];
  const coupon = 'SAVE10';
  const billed = pricing.computeTotals(items, coupon);
  const order = { id: 1009, items, coupon, ...figures(billed) };
  const printed = invoice.computeInvoiceFigures(order);

  assert.deepEqual(figures(billed), {
    subtotal: 2240, discount: 150, tax: 177.65, cgst: 88.83, sgst: 88.82, total: 2267.65
  });
  assert.deepEqual(figures(printed), figures(billed));
  assert.deepEqual(printed.rows.map(({ gstPercent, lineTax }) => [gstPercent, lineTax]), [
    [5, 52.25], [12, 125.4]
  ]);

  const html = invoice.render(order);
  assert.match(html, /<td class="r">5%<\/td><td class="r">\u20b952\.25<\/td>/);
  assert.match(html, /<td class="r">12%<\/td><td class="r">\u20b9125\.40<\/td>/);
  assert.match(html, /Invoice Total<\/td><td class="r">\u20b92267\.65<\/td>/);
  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
});
