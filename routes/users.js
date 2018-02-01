const express = require('express');
const router = express.Router();

const Db = require('../services/db');
const createTable = require('../utils/createTable');

const formatMatches = (player) => {
  return player.matches.map((match) => {
    let winner_id = null;
    if (match.played) {
      if (match.player_1_points === 3) {
        winner_id = match.player_1_id;
      } else if (match.player_2_points === 3) {
        winner_id = match.player_2_id;
      }
    }
    return Object.assign({}, match, {winner_id})
  });
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

  player.matches = formatMatches(player);
  player.current_postion = null;
  if (player.tournament) {
    const table = createTable(player.tournament);
    let i = 1;
    for (const position of table) {
      if (position.id === player.id) {
        player.current_postion = i;
        break;
      }
      i++;
    }
  }
  // console.log('Player--', player);
  res.render('users_current', { title: req.params.nick, player: player });
});

module.exports = router;
