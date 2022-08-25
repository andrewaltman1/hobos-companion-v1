(() => {
  window.addEventListener("DOMContentLoaded", (event) => {
    mapboxgl.accessToken = window.mapToken;
    const map = new mapboxgl.Map({
      container: "cluster-map",
      style: "mapbox://styles/mapbox/light-v10",
      center: [-103.59179687498357, 40.66995747013945],
      // center: [-122.433133, 37.784004],
      zoom: 1,
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on("load", function () {
      // Add a new source from our GeoJSON data and
      // set the 'cluster' option to true. GL-JS will
      // add the point_count property to your source data.
      map.addSource("window.mapData", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: window.mapData,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "window.mapData",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#00BCD4",
            10,
            "#2196F3",
            30,
            "#3F51B5",
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "window.mapData",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "window.mapData",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 9,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      // inspect a cluster on click
      map.on("click", "clusters", function (e) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map
          .getSource("window.mapData")
          .getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      map.on("click", "unclustered-point", function (e) {
        const venue = e.features[0].properties.venue;
        // const date = e.features[0].properties.date;
        const shows = window.mapData.features
          .filter((feature) => feature.properties.venue == venue)
          .sort(function (a, b) {
            return a.properties.date - b.properties.date;
          });
        const mostRecent = shows[shows.length - 1];
        const id = mostRecent.properties.showId;
        const coordinates = e.features[0].geometry.coordinates.slice();
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // new mapboxgl.Popup()
        //   .setLngLat(coordinates)
        //   .setHTML(
        //     `<h2>${venue}</>
        //   <br><a href="/${id}">${date}</a>`
        //   )
        //   .addTo(map);

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `
                ${venue} <br>latest: <a/ href="/show/${id}">${mostRecent.properties.date}</a>
      
                  `
          )
          .addTo(map);
      });

      map.on("mouseenter", "clusters", function () {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", function () {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered-point", function () {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", function () {
        map.getCanvas().style.cursor = "";
      });
    });
  });
})();
