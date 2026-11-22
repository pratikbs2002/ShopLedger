const test = require('node:test');
const assert = require('node:assert/strict');
const orders = require('../lib/orders');
const ledger = require('../lib/ledger');

test('order history uses calendar dates and Khata settlements update balances numerically', () => {
  const orderDb = {
    orders: [
      { id: 1004, date: '30/01/2022' },
      { id: 1001, date: '28/12/2021' },
      { id: 1008, date: '15/03/2022' },
      { id: 1002, date: '05/01/2022' }
    ]
  };
  const ids = (list) => list.map(({ id }) => id);
  const customer = {
    id: 1, name: 'Meera Joshi', openingBalance: 450, totalBilled: 1982.01, totalSettled: 1200
  };
  const customerDb = { customers: [customer], settlements: [], nextSettlementId: 505 };
  const settled = ledger.recordSettlement(customerDb, 1, '500.00');
  const updatedBalance = {
    totalSettled: customer.totalSettled,
    balance: ledger.listCustomers(customerDb)[0].balance
  };
  const invalidAmounts = ['abc', 'Infinity', NaN, Infinity, 0, -1, '', null, true, [500]];
  const rejected = invalidAmounts.map((amount) => !ledger.recordSettlement(customerDb, 1, amount).ok);

  assert.deepEqual({
    newestFirst: ids(orders.list(orderDb)),
    from: ids(orders.list(orderDb, { from: '2022-01-05' })),
    to: ids(orders.list(orderDb, { to: '05/01/2022' })),
    range: ids(orders.list(orderDb, { from: '2021-12-28', to: '05/01/2022' })),
    success: settled.ok,
    amount: settled.settlement.amount,
    updatedBalance,
    rejected,
    finalBalance: customer.balance,
    settlementCount: customerDb.settlements.length,
    nextSettlementId: customerDb.nextSettlementId
  }, {
    newestFirst: [1008, 1004, 1002, 1001],
    from: [1008, 1004, 1002],
    to: [1002, 1001],
    range: [1002, 1001],
    success: true,
    amount: 500,
    updatedBalance: { totalSettled: 1700, balance: 732.01 },
    rejected: invalidAmounts.map(() => true),
    finalBalance: 732.01,
    settlementCount: 1,
    nextSettlementId: 506
  });
});