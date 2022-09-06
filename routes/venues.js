const express = require("express");
const router = express.Router();
const db = require("../db");
const { catchAsync, stateAbrevToName } = require("../utils");
const Venue = require("../models/venue");
const FeatureCollection = require("../models/feature-collection");

router.get(
  "/venues",
  catchAsync(async (req, res) => {
    let { rows } = await db.getAllVenues();

    res.render("venues/all-venues", {
      allVenues: new FeatureCollection(rows),
      user: req.user,
      table: {
        title: "All Venues",
        subtitleOne: `Unique Venues:  ${rows.length}`,
        subtitleTwo: `Total Plays:  ${rows[0].totalPerformances}`,
        headerOne: "Name ",
        headerTwo: "City ",
        headerThree: "State ",
        rows: "venues",
      },
    });
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    let { rows } = await db.getVenueByID(id);

    res.render("venues/single-venue", {
      venue: new Venue(rows[0], rows),
      user: req.user,
    });
  })
);

router.get(
  "/venues/cities/:city.:state",
  catchAsync(async (req, res) => {
    let { city, state } = req.params;
    let { rows } = await db.getVenuesByCity(city, state);

    let cityShows = new FeatureCollection(rows);

    res.render("venues/city", {
      cityShows: cityShows,
      center: [rows[0].centerLng, rows[0].centerLat],
      user: req.user,
      table: {
        title: `${cityShows.features[0].properties.city}, ${
          !cityShows.features[0].properties.state
            ? cityShows.features[0].properties.country
            : cityShows.features[0].properties.state
        }`,
        subtitleOne: `Unique Venues: ${cityShows.features.length}`,
        subtitleTwo: `Total Plays: ${cityShows.features.reduce(
          (p, c) => p + c.properties.total,
          0
        )}`,
        headerOne: "Total ",
        headerTwo: "Venue ",
        headerThree: "Recent ",
        rows: "city",
      },
    });
  })
);

router.get(
  "/venues/states/:state",
  catchAsync(async (req, res) => {
    let { state } = req.params;
    let { rows } = await db.getVenuesByState(state);

    let stateShows = new FeatureCollection(rows);

    res.render("venues/state", {
      // stateName: state.length == 2 ? stateAbrevToName(state) : state,
      stateShows: stateShows,
      center: [rows[0].centerLng, rows[0].centerLat],
      user: req.user,
      table: {
        title: `${
          stateShows.features[0].properties.state
            ? (state.length == 2
              ? `${stateAbrevToName(state)}, ${stateShows.features[0].properties.country}`
              : `${state}, ${stateShows.features[0].properties.country}`)
            : stateShows.features[0].properties.country
        }`,
        subtitleOne: `Unique Venues: ${stateShows.features.length}`,
        subtitleTwo: `Total Plays: ${stateShows.features.reduce(
          (p, c) => p + c.properties.total,
          0
        )}`,
        headerOne: "Total ",
        headerTwo: "Venue ",
        headerThree: "Location ",
        rows: "state",
      },
    });
  })
);

module.exports = router;
