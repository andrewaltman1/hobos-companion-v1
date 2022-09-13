(() => {
  // implement map mode later

  // mapboxgl.accessToken = window.clusterMap.mapToken;
  // const map = new mapboxgl.Map({
  //   container: "map",
  //   style: "mapbox://styles/mapbox/light-v10",
  //   center: window.clusterMap.mapData.venue.geometry.coordinates,
  //   zoom: 10,
  //   boxZoom: false,
  //   scrollZoom: false,
  // });

  // new mapboxgl.Marker()
  //   .setLngLat(window.clusterMap.mapData.venue.geometry.coordinates)
  //   .setPopup(
  //     new mapboxgl.Popup({ offset: 25 }).setHTML(
  //       `<h3>${window.clusterMap.mapData.venue.name}</h3><p>${window.clusterMap.mapData.date}</p>`
  //     )
  //   )
  //   .addTo(map);
  window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    document.querySelector("#view-mode-button").classList.toggle("hide");
    // function userAttendance(e) {
    //   console.log(attendance);
    //   attendance.innerText = "I was there.";
    // }
    // document.querySelector(".attendance").addEventListener("click", (e) => {
    //   if (e.target.innerText == "Did you attend?") {
    //     e.target.innerText = "I was there.";
    //   } else {
    //     e.target.innerText = "Did you attend?";
    //   }
    // });
  });
})();
