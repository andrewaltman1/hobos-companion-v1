(() => {
  window.addEventListener('DOMContentLoaded', (event) => {
    mapboxgl.accessToken = window.clusterMap.mapToken;
    const map = new mapboxgl.Map({
      container: 'cluster-map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: window.clusterMap.center,
      zoom: window.clusterMap.zoom,
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function () {
      map.addSource('window.clusterMap.mapData', {
        type: 'geojson',
        data: window.clusterMap.mapData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'window.clusterMap.mapData',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#00BCD4',
            10,
            '#2196F3',
            30,
            '#3F51B5',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25],
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'window.clusterMap.mapData',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'window.clusterMap.mapData',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties.cluster_id;
        map
          .getSource('window.clusterMap.mapData')
          .getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.on('click', 'unclustered-point', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(
            `<h1><a href="/venues/${e.features[0].properties.venueId}">${e.features[0].properties.venue}</a></h1><ul></ul>`
          )
          .addTo(map);

        const ul = document.querySelector('.mapboxgl-popup-content ul');

        if (window.clusterMap.mapData.features[0].properties.showId) {
          window.clusterMap.mapData.features
            .filter(
              (feature) =>
                feature.properties.venue == e.features[0].properties.venue
            )
            .forEach((feature) => {
              ul.innerHTML += `<li><a href="/show/${feature.properties.showId}">
              ${new Date(feature.properties.date).toLocaleDateString()}
            </a></li>`;
            });
        } else if (window.clusterMap.mapData.features[0].properties.total) {
          ul.innerHTML += `<li>Total Shows: ${e.features[0].properties.total}</li>`;
        }
      });

      map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
      });
    });
  });
})();
