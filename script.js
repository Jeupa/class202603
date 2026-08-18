let map;

let currentLatitude = null;
let currentLongitude = null;

let departureLatitude = null;
let departureLongitude = null;

let destinationLatitude = null;
let destinationLongitude = null;

let departureMarker = null;
let destinationMarker = null;


/* =====================================
   페이지 시작
===================================== */

window.addEventListener("DOMContentLoaded", function () {

  initializeMap();

  getCurrentLocation(true);

});


/* =====================================
   지도 생성
===================================== */

function initializeMap() {

  const mapContainer =
    document.getElementById("map");


  const defaultPosition =
    new kakao.maps.LatLng(
      37.5665,
      126.9780
    );


  map = new kakao.maps.Map(
    mapContainer,
    {
      center: defaultPosition,
      level: 5
    }
  );

}


/* =====================================
   현재 위치 가져오기
===================================== */

function getCurrentLocation(setAsDeparture = false) {

  const result =
    document.getElementById("departureResult");


  if (!navigator.geolocation) {

    result.innerHTML =
      "이 브라우저에서는 위치 정보를 사용할 수 없습니다.";

    return;

  }


  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentLatitude =
        position.coords.latitude;

      currentLongitude =
        position.coords.longitude;


      const currentPosition =
        new kakao.maps.LatLng(
          currentLatitude,
          currentLongitude
        );


      /* 페이지 시작 시
         지도 중심을 현재 위치로 이동
      */

      map.setCenter(currentPosition);

      map.setLevel(3);


      if (setAsDeparture) {

        setDeparture(
          currentLatitude,
          currentLongitude,
          "현재 위치로 출발지 설정"
        );

      }

    },


    function (error) {

      console.error(error);

      result.innerHTML =
        "현재 위치를 확인할 수 없습니다.";

    },


    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

}


/* =====================================
   현재 위치 버튼
===================================== */

document
  .getElementById("currentLocationBtn")
  .addEventListener(
    "click",
    function () {

      if (
        currentLatitude !== null &&
        currentLongitude !== null
      ) {

        setDeparture(
          currentLatitude,
          currentLongitude,
          "현재 위치"
        );

      }

      else {

        getCurrentLocation(true);

      }

    }
  );


/* =====================================
   출발지 검색
===================================== */

document
  .getElementById("departureSearchBtn")
  .addEventListener(
    "click",
    searchDeparture
  );


document
  .getElementById("departureInput")
  .addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        searchDeparture();
      }

    }
  );


function searchDeparture() {

  const keyword =
    document
      .getElementById("departureInput")
      .value
      .trim();


  if (!keyword) {
    return;
  }


  searchPlace(
    keyword,
    "departure"
  );

}


/* =====================================
   목적지 검색
===================================== */

document
  .getElementById("destinationSearchBtn")
  .addEventListener(
    "click",
    searchDestination
  );


document
  .getElementById("destinationInput")
  .addEventListener(
    "keydown",
    function (event) {

      if (event.key === "Enter") {
        searchDestination();
      }

    }
  );


function searchDestination() {

  const keyword =
    document
      .getElementById("destinationInput")
      .value
      .trim();


  if (!keyword) {
    return;
  }


  searchPlace(
    keyword,
    "destination"
  );

}


/* =====================================
   카카오 장소 검색
===================================== */

function searchPlace(keyword, type) {

  const places =
    new kakao.maps.services.Places();


  places.keywordSearch(
    keyword,

    function (data, status) {

      if (
        status ===
        kakao.maps.services.Status.OK
      ) {

        showSearchResults(
          data.slice(0, 10),
          type
        );

      }

      else {

        showNoResult(type);

      }

    }
  );

}


/* =====================================
   자동완성 목록 표시
===================================== */

function showSearchResults(
  places,
  type
) {

  const containerId =
    type === "departure"
      ? "departureSearchResults"
      : "destinationSearchResults";


  const container =
    document.getElementById(
      containerId
    );


  container.innerHTML = "";


  places.forEach(
    function (place) {

      const item =
        document.createElement("div");


      item.className =
        "search-result-item";


      const address =
        place.road_address_name ||
        place.address_name;


      item.innerHTML = `
        <div class="place-name">
          ${place.place_name}
        </div>

        <div class="place-address">
          ${address}
        </div>
      `;


      item.addEventListener(
        "click",
        function () {

          const latitude =
            Number(place.y);

          const longitude =
            Number(place.x);


          if (type === "departure") {

            setDeparture(
              latitude,
              longitude,
              place.place_name,
              address
            );


            document
              .getElementById(
                "departureInput"
              )
              .value =
              place.place_name;

          }

          else {

            setDestination(
              latitude,
              longitude,
              place.place_name,
              address
            );


            document
              .getElementById(
                "destinationInput"
              )
              .value =
              place.place_name;

          }


          container.style.display =
            "none";

        }
      );


      container.appendChild(item);

    }
  );


  container.style.display =
    "block";

}


/* =====================================
   검색 결과 없음
===================================== */

function showNoResult(type) {

  const containerId =
    type === "departure"
      ? "departureSearchResults"
      : "destinationSearchResults";


  const container =
    document.getElementById(
      containerId
    );


  container.innerHTML = `
    <div class="search-result-item">
      검색 결과가 없습니다.
    </div>
  `;


  container.style.display =
    "block";

}


/* =====================================
   출발지 선택
===================================== */

function setDeparture(
  latitude,
  longitude,
  name,
  address = ""
) {

  departureLatitude =
    latitude;

  departureLongitude =
    longitude;


  const position =
    new kakao.maps.LatLng(
      latitude,
      longitude
    );


  if (departureMarker) {
    departureMarker.setMap(null);
  }


  departureMarker =
    new kakao.maps.Marker({

      map: map,

      position: position

    });


  document
    .getElementById(
      "departureResult"
    )
    .innerHTML = `
      <strong>${name}</strong>
      ${
        address
        ? "<br>" + address
        : ""
      }
    `;


  updateMapBounds();

}


/* =====================================
   목적지 선택
===================================== */

function setDestination(
  latitude,
  longitude,
  name,
  address = ""
) {

  destinationLatitude =
    latitude;

  destinationLongitude =
    longitude;


  const position =
    new kakao.maps.LatLng(
      latitude,
      longitude
    );


  if (destinationMarker) {
    destinationMarker.setMap(null);
  }


  destinationMarker =
    new kakao.maps.Marker({

      map: map,

      position: position

    });


  document
    .getElementById(
      "destinationResult"
    )
    .innerHTML = `
      <strong>${name}</strong>
      ${
        address
        ? "<br>" + address
        : ""
      }
    `;


  updateMapBounds();

}


/* =====================================
   출발지 + 목적지 지도에 같이 표시
===================================== */

function updateMapBounds() {

  if (
    departureLatitude !== null &&
    destinationLatitude !== null
  ) {

    const bounds =
      new kakao.maps.LatLngBounds();


    bounds.extend(
      new kakao.maps.LatLng(
        departureLatitude,
        departureLongitude
      )
    );


    bounds.extend(
      new kakao.maps.LatLng(
        destinationLatitude,
        destinationLongitude
      )
    );


    map.setBounds(bounds);

  }

  else if (
    departureLatitude !== null
  ) {

    map.setCenter(
      new kakao.maps.LatLng(
        departureLatitude,
        departureLongitude
      )
    );

  }

  else if (
    destinationLatitude !== null
  ) {

    map.setCenter(
      new kakao.maps.LatLng(
        destinationLatitude,
        destinationLongitude
      )
    );

  }

}
