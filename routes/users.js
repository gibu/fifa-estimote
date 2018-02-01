const express = require('express');
const router = express.Router();

const Db = require('../services/db');

const formatMatches = (player) => {
};
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:nick', async function(req, res, next) {
  const player = await Db.getPlayerByNick(req.params.nick);
  if (!player) {
    return res.status(404);
  }
  // console.log('Player---', player);
  res.render('users_current', { title: req.params.nick, player: player });
});

module.exports = router;
