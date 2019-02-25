const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  console.log('Hey there');
  const me = {name: 'Alex', age: 100, cool: true };
  // res.json(me);
  res.send(req.query);
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);

});

module.exports = router;
