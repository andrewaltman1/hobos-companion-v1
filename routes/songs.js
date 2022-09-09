const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
const Song = require("../models/song");
const data = require("../data")

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongs();
    res.render("table-map", data.allSongs(req, rows));
  })
);

router.get(
  "/songs/author/:author",
  catchAsync(async (req, res) => {
    const { author } = req.params;
    let { rows } = await db.getAllSongsByAuthor(author);
    res.render("table-map", data.allSongs(req, rows, author));
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getSongByID(id);
    res.render("song", {
      song: new Song(rows[0]),
      user: req.user,
    });
  })
);

module.exports = router;
