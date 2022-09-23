const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
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
    let { rows } = await db.getAllSongsByAuthor(req.params.author);
    res.render("table-map", data.allSongs(req, rows, req.params.author));
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    let { rows } = await db.getSongByID(req.params.id);
    res.render("single-model", data.singleSong(req, rows));
  })
);

module.exports = router;
