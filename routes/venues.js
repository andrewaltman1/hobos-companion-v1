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

    let allVenues = new FeatureCollection(rows);

    res.render("table-map", {
      allVenues: allVenues,
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
      clusterMap: {
        mapToken: process.env.MAPBOX_TOKEN,
        mapData: allVenues,
        mapCenter: [-103.59179687498357, 40.66995747013945]},
      scripts: { page: "/public/scripts/venues-script.js" },
    });
  })
);

router.get(
  "/venues/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    let { rows } = await db.getVenueByID(id);

    console.log(rows);

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

    res.render("table-map", {
      cityShows: cityShows,
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
        clusterMap: {
          mapToken: process.env.MAPBOX_TOKEN,
          mapData: cityShows,
          mapCenter: [rows[0].centerLng, rows[0].centerLat],
        },
      scripts: { page: "/public/scripts/city-script.js" },
    });
  })
);

router.get(
  "/venues/states/:state",
  catchAsync(async (req, res) => {
    let { state } = req.params;
    let { rows } = await db.getVenuesByState(state);

    let stateShows = new FeatureCollection(rows);

    res.render("table-map", {
      stateShows: stateShows,
      user: req.user,
      table: {
        title: `${
          stateShows.features[0].properties.state
            ? state.length == 2
              ? `${stateAbrevToName(state)}, ${
                  stateShows.features[0].properties.country
                }`
              : `${state}, ${stateShows.features[0].properties.country}`
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
      clusterMap: {
        mapToken: process.env.MAPBOX_TOKEN,
        mapData: stateShows,
        mapCenter: [rows[0].centerLng, rows[0].centerLat],
      },
      scripts: {page: "/public/scripts/state-script.js"}
    });
  })
);

module.exports = router;
