const express = require('express');
const router = express.Router();

const { getOrderBookTips } = require('../utils/orderbook');

router.get('/:symbol-:currency', async (req, res) => {
  res.send(
    await getOrderBookTips(`${req.params.symbol}${req.params.currency}`)
  );
});

module.exports = router;
