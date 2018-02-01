const  express = require('express');
const _ = require('lodash');
const pug = require('pug');
const router = express.Router();

const Db = require('../services/db');

/* GET active tournamets. */

const createTable = (tournament) => {
  let playerScores = _.cloneDeep(tournament.players);
  playerScores = playerScores.map((player) => (
    Object.assign({}, player, {
      points: 0,
      matches: 0,
      for: 0,
      against: 0,
      wins: 0,
      draws: 0,
      loses: 0,
    })
  ));
  tournament.matches.forEach((match) => {
    if (match.played) {
      const player1 = _.find(playerScores, {id: match.player_1_id})
      player1.matches++;
      player1.points += match.player_1_points;
      player1.for += match.player_1_goals;
      player1.against += match.player_2_goals;
      if (match.player_1_points === 3) {
        player1.wins += 1;
      } else if (match.player_1_points === 1) {
        player1.draws += 1;
      } else {
        player1.loses += 1;
      }
      const player2 = _.find(playerScores, {id: match.player_2_id});
      player2.matches++;
      player2.points += match.player_2_points;
      player2.for += match.player_2_goals;
      player2.against += match.player_1_goals;
      if (match.player_2_points === 3) {
        player2.wins += 1;
      } else if (match.player_2_points === 1) {
        player2.draws += 1;
      } else {
        player2.loses += 1;
      }
    };
  });

  playerScores = playerScores.map((ps) => (
    Object.assign({}, ps, {goal_difference: ps.for - ps.against})
  ));
  return _.orderBy(playerScores, ['points', 'goal_difference'], ['desc', 'desc']);
};

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

router.get('/next_match', async function (req, res) {
  res.status(200).json(await Db.getNextMatch())
});

router.post('/save_match', async function (req, res) {
  const {player_1_id, player_2_id, player_1_goals, player_2_goals } = req.body;
  if (_.isNil(player_1_id) || _.isNil(player_2_id) || _.isNil(player_1_goals) || _.isNil(player_2_goals)) {
    return res.status(400).json({
      message: 'Missing required params',
    });
  };
  console.log(player_1_id, player_2_id, player_1_goals, player_2_goals);
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
