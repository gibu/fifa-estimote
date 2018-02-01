const  express = require('express');
const _ = require('lodash');
const pug = require('pug');
const router = express.Router();

const Db = require('../services/db');

const createTable = require('../utils/createTable');

router.get('/', async function (req, res) {
  res.status(200).json(await Db.getNextMatch());
  // res.render('tournament_start');
});

router.get('/active', async function(req, res, next) {
  let tournament = await Db.getActiveTournament();
  const table = createTable(tournament);
  res.render('active_tournament', { title: 'Active Tournament', table });
});

router.get('/table', async function (req, res) {
  let tournament = await Db.getActiveTournament();
  const table = createTable(tournament);
  const compileFn = pug.compileFile('./views/table.pug');
  return res.status(200)
    .json({table: JSON.stringify(compileFn({table}))});
});

router.get('/scores', async function (req, res) {
  try {
    const nextMatch = await Db.getNextMatch();
    res.render('scores', {
      player_1_id: nextMatch.player_1.id,
      player_2_id: nextMatch.player_2.id,
      player_1_nick: nextMatch.player_1.nick,
      player_2_nick: nextMatch.player_2.nick,
    });
  } catch (error) {
    res.render('no_next_match');
  }
});

router.get('/next_match', async function (req, res) {
  res.status(200).json(await Db.getNextMatch())
});

router.post('/save_match', async function (req, res) {
  const {player_1_id, player_2_id, player_1_goals, player_2_goals } = req.body;
  console.log(player_1_id, player_2_id, player_1_goals, player_2_goals);
  if (_.isNil(player_1_id) || _.isNil(player_2_id) || _.isNil(player_1_goals) || _.isNil(player_2_goals)) {
    return res.status(400).json({
      message: 'Missing required params',
    });
  };
  await Db.saveMatch({player_1_id, player_2_id, player_1_goals, player_2_goals});
  return res.status(200).json({});
});

router.post('/join', async function (req, res) {

});

router.post('/start', async function(req, res, next) {
  const {tournament_id: tournamentId} = req.body;
  const tournament = await Db.startTournament(parseInt(tournamentId));
  res.status(200).json({status: 'ok'});
});

module.exports = router;
