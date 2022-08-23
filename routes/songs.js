const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { catchAsync, sumSinglePropOfArrEl } = require("../utils");
const Song = require("../models/song");

const pool = new Pool({
  user: "andrewaltman",
  host: "localhost",
  database: "rre-shows",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
pool.connect();

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    const user = req.user;
    let { rows } = await pool.query(
      `SELECT id, title, author, versions_count as "timesPlayed" FROM songs WHERE songs.is_song = true ORDER BY "timesPlayed" DESC`
    );

    let totalPerformed = sumSinglePropOfArrEl(rows);

    res.render("songs/all-songs", { rows, totalPerformed, user });
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    let { rows } = await pool.query(
      `SELECT title, author, notes, versions_count as "timesPlayed", (
        SELECT to_char(MIN(date), 'MM-DD-YYYY') as "firstTimePlayed" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
        ), (
        SELECT to_char(MAX(date), 'MM-DD-YYYY') as "mostRecent" from shows JOIN versions on shows.id = show_id JOIN songs on songs.id = song_id WHERE songs.id = $1
        ) 
        FROM songs WHERE songs.id = $1`,
      [id]
    );

    let song = new Song(rows[0]);

    // res.send(song);

    res.render("songs/single-song", { song, user });
  })
);

module.exports = router;
