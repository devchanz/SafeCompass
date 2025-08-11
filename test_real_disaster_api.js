// 실제 긴급재난문자 API 테스트
async function testRealDisasterAPI() {
  try {
    console.log('🚨 실제 긴급재난문자 API 테스트 시작');
    
    const response = await fetch('http://localhost:5000/api/emergency/test-real-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testMode: true
      })
    });

    const result = await response.json();
    console.log('📊 테스트 결과:', result);
    
    if (result.success) {
      console.log('✅ 실제 정부 재난 API 연동 성공!');
      if (result.realData) {
        console.log('🚨 실제 재난 데이터 발견:', result.realData);
      } else {
        console.log('📄 현재 위급 재난 없음 - 시뮬레이션 데이터 사용');
      }
    } else {
      console.log('❌ API 테스트 실패:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 오류:', error);
  }
}

// 브라우저 환경에서 실행
if (typeof window !== 'undefined') {
  testRealDisasterAPI();
} else {
  // Node.js 환경에서 실행
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testRealDisasterAPI();
  });
}