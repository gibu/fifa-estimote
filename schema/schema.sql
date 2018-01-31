CREATE TABLE players (
    id      SERIAL PRIMARY KEY,
    nick  varchar(255) UNIQUE,
    club varchar(255),
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO players(nick, club) VALUES('dziku', 'Real Madrid');
INSERT INTO players(nick, club) VALUES('suchy', 'Cracovia');
INSERT INTO players(nick, club) VALUES('magda', 'Bayern Munich');
INSERT INTO players(nick, club) VALUES('chwastek', 'FC Chelsea');


//status pending, active, finished
INSERT INTO tournaments(name) VALUES ('fifa_hack');

CREATE TABLE tournaments (
    id      SERIAL PRIMARY KEY,
    name  varchar(255) NOT NULL,
    status varchar(255) NOT NULL DEFAULT 'pending',
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


CREATE TABLE tournament_players (
    id      SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    tournament_id INTEGER NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

INSERT INTO tournament_players(player_id, tournament_id) VALUES (1,1);
INSERT INTO tournament_players(player_id, tournament_id) VALUES (2,1);
INSERT INTO tournament_players(player_id, tournament_id) VALUES (3,1);
INSERT INTO tournament_players(player_id, tournament_id) VALUES (4,1);

CREATE TABLE matches (
    id      SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    player_1_id INTEGER NOT NULL,
    player_2_id INTEGER NOT NULL,
    player_1_goals INTEGER,
    player_2_goals INTEGER,
    player_1_points INTEGER,
    player_2_points INTEGER,
    sequence INTEGER,
    played BOOLEAN DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
