// 대전 근처 대피소가 있는지 확인하기 위한 테스트 스크립트
const fetch = require('node-fetch');

async function testShelterAPI() {
  const apiKey = process.env.DISASTER_API_KEY;
  
  // 더 많은 데이터를 페이지별로 가져와서 대전 근처 대피소 찾기
  for (let page = 1; page <= 10; page++) {
    try {
      const response = await fetch(
        `https://apis.data.go.kr/1741000/EqkShelter3/getEqkShelter1List?serviceKey=${apiKey}&pageNo=${page}&numOfRows=100&dataType=json`
      );
      
      if (!response.ok) {
        console.log(`Page ${page}: API 호출 실패`);
        continue;
      }
      
      const data = await response.json();
      const items = data.body || [];
      
      console.log(`Page ${page}: ${items.length}개 대피소`);
      
      // 대전 근처 (위도 36.3, 경도 127.4 기준 50km 이내) 대피소 찾기
      const daejeonShelters = items.filter(item => {
        const lat = parseFloat(item.LAT || 0);
        const lng = parseFloat(item.LOT || 0);
        
        if (lat === 0 || lng === 0) return false;
        
        // 대전 근처 범위 체크 (대략적인 범위)
        return lat >= 36.0 && lat <= 36.8 && lng >= 126.8 && lng <= 128.0;
      });
      
      if (daejeonShelters.length > 0) {
        console.log(`Page ${page}에서 대전 근처 대피소 ${daejeonShelters.length}개 발견!`);
        daejeonShelters.forEach(shelter => {
          console.log(`- ${shelter.SHLT_NM} (${shelter.ADDR}) - LAT: ${shelter.LAT}, LOT: ${shelter.LOT}`);
        });
      }
      
      // 처음 몇 개 항목의 지역 확인
      if (page <= 3) {
        console.log(`Page ${page} 샘플 지역:`);
        items.slice(0, 3).forEach(item => {
          console.log(`  - ${item.SHLT_NM}: ${item.CTPV_NM} ${item.SGG_NM}`);
        });
      }
      
    } catch (error) {
      console.error(`Page ${page} 오류:`, error.message);
    }
  }
}

testShelterAPI().catch(console.error);