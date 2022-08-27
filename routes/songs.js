const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, sumSinglePropOfArrEl } = require("../utils");
const Song = require("../models/song");

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongs();

    res.render("songs/all-songs", {
      rows,
      totalPerformed: sumSinglePropOfArrEl(rows),
      user: req.user,
    });
  })
);

router.get(
  "/songs/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getSongByID(id);

    res.render("songs/single-song", {
      song: new Song(rows[0]),
      user: req.user,
    });
  })
);

module.exports = router;
