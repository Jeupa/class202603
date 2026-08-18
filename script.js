let map = null;

let currentMarker = null;
let destinationMarker = null;

let currentLatitude = null;
let currentLongitude = null;

let destinationPlaces = [];


/* -------------------------
   현재 위치
------------------------- */

document
  .getElementById("locationBtn")
  .addEventListener("click", getLocation);


function getLocation() {

  const result =
    document.getElementById("locationResult");


  if (!navigator.geolocation) {

    result.innerHTML =
      "이 브라우저에서는 위치 정보를 사용할 수 없습니다.";

    return;
  }


  result.innerHTML =
    "📍 현재 위치를 확인하고 있습니다...";


  navigator.geolocation.getCurrentPosition(

    function(position) {

      currentLatitude =
        position.coords.latitude;

      currentLongitude =
        position.coords.longitude;


      result.innerHTML = `
        <strong>현재 위치 확인 완료</strong><br>
        위도 : ${currentLatitude.toFixed(6)}<br>
        경도 : ${currentLongitude.toFixed(6)}
      `;


      showCurrentLocation();

    },


    function(error) {

      console.error(error);

      result.innerHTML =
        "현재 위치를 가져오지 못했습니다.";

    },


    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

}



/* -------------------------
   지도
------------------------- */

function showCurrentLocation() {

  const mapContainer =
    document.getElementById("map");


  mapContainer.style.display = "block";


  const position =
    new kakao.maps.LatLng(
      currentLatitude,
      currentLongitude
    );


  // 지도가 아직 없으면 생성
  if (!map) {

    const mapOption = {

      center: position,

      level: 3

    };


    map =
      new kakao.maps.Map(
        mapContainer,
        mapOption
      );

  }


  map.setCenter(position);


  // 기존 현재 위치 마커 제거
  if (currentMarker) {
    currentMarker.setMap(null);
  }


  currentMarker =
    new kakao.maps.Marker({

      map: map,

      position: position

    });


  const infoWindow =
    new kakao.maps.InfoWindow({

      content:
        '<div style="padding:7px;width:110px;text-align:center;">현재 위치</div>'

    });


  infoWindow.open(
    map,
    currentMarker
  );

}



/* -------------------------
   목적지 검색
------------------------- */

document
  .getElementById("searchBtn")
  .addEventListener("click", searchDestination);


document
  .getElementById("destinationInput")
  .addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
      searchDestination();
    }

  });



function searchDestination() {

  const keyword =
    document
      .getElementById("destinationInput")
      .value
      .trim();


  const result =
    document.getElementById(
      "destinationResult"
    );


  if (!keyword) {

    result.innerHTML =
      "검색어를 입력해주세요.";

    return;
  }


  result.innerHTML =
    "🔎 장소를 검색하고 있습니다...";


  const places =
    new kakao.maps.services.Places();


  places.keywordSearch(
    keyword,
    placesSearchCallback
  );

}



/* -------------------------
   검색 결과
------------------------- */

function placesSearchCallback(data, status) {

  const select =
    document.getElementById(
      "destinationSelect"
    );


  const result =
    document.getElementById(
      "destinationResult"
    );


  select.innerHTML =
    '<option value="">검색 결과를 선택하세요</option>';


  if (
    status !==
    kakao.maps.services.Status.OK
  ) {

    result.innerHTML =
      "검색 결과가 없습니다.";

    return;
  }


  destinationPlaces = data;


  // 너무 많은 후보가 나오지 않도록
  // 상위 10개만 표시
  data.slice(0, 10).forEach(
    function(place, index) {

      const option =
        document.createElement("option");


      option.value = index;


      let text =
        place.place_name;


      if (place.road_address_name) {

        text +=
          " - " +
          place.road_address_name;

      }

      else if (place.address_name) {

        text +=
          " - " +
          place.address_name;

      }


      option.textContent =
        text;


      select.appendChild(option);

    }
  );


  result.innerHTML =
    `${Math.min(data.length, 10)}개의 후보를 찾았습니다.`;

}



/* -------------------------
   목적지 선택
------------------------- */

document
  .getElementById("destinationSelect")
  .addEventListener(
    "change",
    selectDestination
  );


function selectDestination() {

  const select =
    document.getElementById(
      "destinationSelect"
    );


  const index =
    select.value;


  if (index === "") {
    return;
  }


  const place =
    destinationPlaces[index];


  const latitude =
    Number(place.y);

  const longitude =
    Number(place.x);


  const result =
    document.getElementById(
      "destinationResult"
    );


  result.innerHTML = `
    <strong>${place.place_name}</strong><br>
    ${place.road_address_name || place.address_name}
  `;


  showDestination(
    latitude,
    longitude,
    place.place_name
  );

}



/* -------------------------
   목적지 지도 표시
------------------------- */

function showDestination(
  latitude,
  longitude,
  name
) {

  const mapContainer =
    document.getElementById("map");


  mapContainer.style.display =
    "block";


  const position =
    new kakao.maps.LatLng(
      latitude,
      longitude
    );


  // 현재 위치 확인 전이라도
  // 목적지는 지도에 표시 가능
  if (!map) {

    map =
      new kakao.maps.Map(
        mapContainer,
        {
          center: position,
          level: 4
        }
      );

  }


  // 기존 목적지 마커 삭제
  if (destinationMarker) {

    destinationMarker.setMap(null);

  }


  destinationMarker =
    new kakao.maps.Marker({

      map: map,

      position: position

    });


  const infoWindow =
    new kakao.maps.InfoWindow({

      content:
        `<div style="padding:7px;width:140px;text-align:center;">🎯 ${name}</div>`

    });


  infoWindow.open(
    map,
    destinationMarker
  );


  /*
   현재위치 + 목적지가 모두 있으면
   두 지점이 지도에 함께 보이도록 조정
  */

  if (
    currentLatitude !== null &&
    currentLongitude !== null
  ) {

    const bounds =
      new kakao.maps.LatLngBounds();


    bounds.extend(
      new kakao.maps.LatLng(
        currentLatitude,
        currentLongitude
      )
    );


    bounds.extend(position);


    map.setBounds(bounds);

  }

  else {

    map.setCenter(position);

  }

}
