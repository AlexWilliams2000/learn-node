const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  console.log('Hey there');
  const me = {name: 'Alex', age: 100, cool: true };
  // res.json(me);
  // res.send(req.query);
  res.render('hello', {
    name: 'me',
    dog: req.query.dog ? req.query.dog : 'tiddles the bull mastiff',
    title: 'I love food!'
  });
});
 
router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);

});

module.exports = router;
