document
  .getElementById("locationBtn")
  .addEventListener("click", getLocation);


function getLocation() {

  const result = document.getElementById("locationResult");

  if (!navigator.geolocation) {
    result.innerHTML =
      "이 브라우저에서는 위치 정보를 사용할 수 없습니다.";
    return;
  }

  result.innerHTML =
    "📍 현재 위치를 확인하고 있습니다...";


  navigator.geolocation.getCurrentPosition(

    function(position) {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      result.innerHTML = `
        <strong>📍 현재 위치 확인 완료</strong>
        <br><br>
        위도 : ${latitude.toFixed(6)}
        <br>
        경도 : ${longitude.toFixed(6)}
      `;

      showMap(latitude, longitude);
    },

    function(error) {

      console.error(error);

      let message = "위치 정보를 가져오지 못했습니다.";

      if (error.code === 1) {
        message = "위치 정보 사용 권한이 거부되었습니다.";
      } else if (error.code === 2) {
        message = "현재 위치를 확인할 수 없습니다.";
      } else if (error.code === 3) {
        message = "위치 확인 시간이 초과되었습니다.";
      }

      result.innerHTML = message;
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}


function showMap(latitude, longitude) {

  const mapContainer = document.getElementById("map");

  mapContainer.style.display = "block";

  if (typeof kakao === "undefined") {
    document.getElementById("locationResult").innerHTML +=
      "<br><br>❌ 카카오 지도 SDK가 로드되지 않았습니다.";
    return;
  }

  const currentPosition =
    new kakao.maps.LatLng(latitude, longitude);

  const mapOption = {
    center: currentPosition,
    level: 3
  };

  const map =
    new kakao.maps.Map(mapContainer, mapOption);

  const marker =
    new kakao.maps.Marker({
      position: currentPosition
    });

  marker.setMap(map);

  const infoWindow =
    new kakao.maps.InfoWindow({
      content:
        '<div style="padding:8px;width:130px;text-align:center;">📍 현재 위치</div>'
    });

  infoWindow.open(map, marker);
}
