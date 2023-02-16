const debug = require('debug')('rather-challenge:orderbook-service');
const WebSocket = require('ws');

const ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2');

const symbolChannels = {};
const channels = {};
const orderBooks = {};

ws.on('open', () => {
  debug('Connected to Bitfinex');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  if (message.event === 'subscribed') {
    symbolChannels[message.symbol] = message.chanId;
    channels[message.chanId] = message.symbol;
    debug('Subscribed to %s (%s)', message.symbol, message.chanId);
    return;
  }
  if (message.event === 'unsubscribed') {
    delete symbolChannels[channels[message.chanId]];
    delete channels[message.chanId];
    debug('Unsubscribed from %s', message.chanId);
    return;
  }
  // If message.event is undefined, it's an order book update
  if (message.event === undefined) {
    handleOrderBookUpdate(message);
  }
});

ws.on('close', () => {
  debug('Disconnected from Bitfinex');
});

ws.on('error', (error) => {
  debug('Error: %s', error);
});

async function subscribeToOrderBook(symbol) {
  if (symbolChannels[symbol] !== undefined) {
    debug('Already subscribed to %s', symbol);
    return;
  }
  ws.send(
    JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol,
      prec: 'P0',
      freq: 'F0',
      len: 25,
    })
  );

  // We need to wait for the subscription to be confirmed before we can
  // start using the order book
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (
        orderBooks[symbol] !== undefined &&
        orderBooks[symbol].bids !== undefined
      ) {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}

function handleOrderBookUpdate(update) {
  let channelId = update[0];
  let changes = update[1];

  if (changes === 'hb') {
    debug('Heartbeat: %s', channelId);
    return;
  }

  // Check if changes is an array of arrays, which means it's a snapshot
  if (changes[0] instanceof Array) {
    changes.forEach((change) => {
      handleOrderBookUpdate([channelId, change]);
    });
    return;
  }

  let orderBook = orderBooks[channels[channelId]];

  // If the order book is empty, we need to initialize it
  if (orderBook === undefined) {
    orderBook = {
      bids: {},
      asks: {},
    };
    orderBooks[channels[channelId]] = orderBook;
  }

  let price = changes[0];
  let count = changes[1];
  let amount = changes[2];

  if (count === 0) {
    if (amount === 1) {
      delete orderBook.bids[price];
    }
    if (amount === -1) {
      delete orderBook.asks[price];
    }
  }

  if (amount > 0) {
    orderBook.bids[price] = amount;
  }

  if (amount < 0) {
    orderBook.asks[price] = amount;
  }
}

async function getOrderBookTips(symbol) {
  let orderBook = orderBooks[symbol];
  if (orderBook === undefined) {
    await subscribeToOrderBook(symbol);
  }

  orderBook = orderBooks[symbol];

  return {
    bids: Object.keys(orderBook.bids)
      .sort((a, b) => b - a)
      .slice(0, 5)
      .map((price) => ({
        price,
        amount: orderBook.bids[price],
      })),
    asks: Object.keys(orderBook.asks)
      .sort((a, b) => a - b)
      .slice(0, 5)
      .map((price) => ({
        price,
        amount: orderBook.asks[price],
      })),
  };
}

module.exports = {
  getOrderBookTips,
};
