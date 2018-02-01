const url = require('url');
const _ = require('lodash');

const parseConnection = (connectionString) => {
  let user;
  let password;
  const { hostname, auth, port, pathname } = url.parse(connectionString);
  const database = pathname.replace('/', '');
  if (auth && auth.split(':').length === 2) {
    [user, password] = auth.split(':');
  }

  return {
    user,
    password,
    host: hostname,
    port,
    database,
  };
};

const connection = parseConnection('postgres://yewdbyfndddgja:886977e1be8a9a354bb1da0fcdeb24dc2a8586758b25cb920fa78f8e412c280a@ec2-54-247-101-191.eu-west-1.compute.amazonaws.com:5432/da7qnnkde2pks8')
connection.ssl = true;

const db = require('knex')({
  connection,
  client: 'pg',
});

class Db {
  static async getTournametById(tournamentId) {
    const tournament = await db('tournaments')
      .where('id', tournamentId)
      .first('*');
    if (!tournament) {
      throw new Error(Db.errors.tournamet_not_found);
    }

    const players = await db('tournament_players')
      .leftJoin('players', 'tournament_players.player_id', 'players.id')
      .select('players.id', 'players.nick', 'players.club');

    const matches = await db('matches')
      .where('tournament_id', tournamentId)
      .select('*');
    return Object.assign({}, tournament, { players, matches });
  }

  static async startTournament(tournamentId) {
    const tournament = await this.getTournametById(tournamentId);
    let matches = [];
    console.log('t--', tournament);
    if (tournament.status !== 'pending') {
      throw new Error(Db.db.cannot_start_tournament);
    }

    const players = tournament.players;
    for(let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        matches.push({
          tournament_id: tournamentId,
          player_1_id: players[i].id,
          player_2_id: players[j].id,
        });
      }
    }
    matches = _.shuffle(matches);
    matches = _.map(matches, (match, i) => (Object.assign({}, match, {sequence: i})));
    await this.createMatches(matches);
    // console.log('M--', matches);
    await this.markTournamentAsActive(tournamentId);
    return this.getTournametById(tournamentId);
  }

  static async createMatches(matches) {
    return db.batchInsert('matches', matches);
  }

  static async getActiveTournament() {
    const tournamet = await db('tournaments')
      .where('status', 'active')
      .first('*');
    if (!tournamet) {
      throw new Error(Db.db.cannot_start_tournament);
    };
    return this.getTournametById(tournamet.id);
  };

  static async markTournamentAsActive(tournamentId) {
    return db('tournaments')
      .where('id', tournamentId)
      .update({
        status: 'active',
        updated_at: new Date(),
      });
  }

  static async getPlayer(playerId) {
    return db('players')
      .where('id', playerId)
      .first('*');
  };

  static async getNextMatch() {
    const activeTournament = await this.getActiveTournament();
    const match = await db('matches')
      .where('tournament_id', activeTournament.id)
      .where('played', false)
      .orderBy('sequence', 'ASC')
      .first('*');

    const [player1, player2] = [await this.getPlayer(match.player_1_id), await this.getPlayer(match.player_2_id)]
    console.log('M---', player2);
    return Object.assign({}, match, {
      player_1: player1,
      player_2: player2,
    });
  }

  static async canSaveMatch({tournament_id, player_1_id, player_2_id}) {
    return await !!db('matches')
      .where({
        tournament_id,
        player_1_id,
        player_2_id,
        active: false,
      })
  }

  static async saveMatch({player_1_id, player_2_id, player_1_goals, player_2_goals}) {
    const activeTournament = await this.getActiveTournament();
    if (!(await this.canSaveMatch({
        tournament_id: activeTournament.id,
        player_1_id,
        player_2_id,
      }))) {
      throw new Error(Db.errors.cannot_save_match);
    }
    let player_1_points;
    let player_2_points;
    if (player_1_goals > player_2_goals) {
      player_1_points = 3;
      player_2_points = 0;
    } else if (player_1_goals === player_2_goals) {
      player_1_points = 1;
      player_2_points = 1;
    } else {
      player_1_points = 0;
      player_2_points = 3;
    }
    return db('matches')
      .where({
        tournament_id: activeTournament.id,
        player_1_id,
        player_2_id,
      })
      .update({
        player_1_goals,
        player_2_goals,
        player_1_points,
        player_2_points,
        played: true,
        updated_at: new Date(),
      });
  }

  static async getMatchesForTournamentIdAndPlayerId(tournamentId, playerId) {
    const query = db('matches')
      .whereRaw(`tournament_id = ? AND (player_1_id = ? OR player_2_id = ?)`, [tournamentId, playerId, playerId])
      .joinRaw('LEFT JOIN players players1 ON matches.player_1_id = players1.id')
      .joinRaw('LEFT JOIN players players2 ON matches.player_2_id = players2.id')
      .orderBy('sequence', 'ASC')
      .select('matches.*', 'players1.nick AS player_1_nick',  'players2.nick AS player_2_nick');

    return query;
  }

  static async getPlayerByNick(nick) {
    const player = await db('players')
      .whereRaw(`lower(nick) = ?`, [nick.toLowerCase()])
      .first('*');

    if (!player) {
      throw Error(Db.errors.player_not_found);
    }
    let matches = [];
    let activeTournament;
    try {
      activeTournament = await this.getActiveTournament();
    } catch (error) {
      console.log('No active tournamet');
    }
    // player.tournament = activeTournament;
    if (activeTournament) {
      player.tournament= await this.getTournametById(activeTournament.id);
      matches = await this.getMatchesForTournamentIdAndPlayerId(activeTournament.id, player.id);
    };


    return Object.assign({}, player, {matches});
  };
};

Db.errors = {
  'tournamet_not_found': 'Tournament not found',
  'cannot_start_tournament': 'Cannot start tournamet',
  'cannot_save_match': 'Cannot save match',
  'player_not_found': 'Player not found',
};

module.exports = Db;
