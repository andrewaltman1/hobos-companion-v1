const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync } = require("../utils");
const { isLoggedIn, isAdmin } = require("../middleware");
const data = require("../data");

router.get(
  "/songs",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllSongs();
    res.render("table-map", data.allSongs(req, rows));
  })
);

router.get(
  "/songs/editor",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    res.render("song-editor", {
      user: req.user,
      song: req.session.newShow.newSongs[0],
    });
  })
);

router.post(
  "/songs/editor",
  isLoggedIn,
  isAdmin,
  catchAsync(async (req, res) => {
    await db.updateSong(req, req.session.newShow.newSongs[0]);
    req.session.newShow.newSongs = req.session.newShow.newSongs.slice(1);
    req.session.newShow.newSongs.length > 0 ? res.render("song-editor", {user: req.user, song: req.session.newShow.newSongs[0]}) : res.render("new-show/confirmation", {user: req.user, songs: req.session.newShow.newSongs, title: "Song"})
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
