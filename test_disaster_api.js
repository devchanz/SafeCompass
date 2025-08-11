// 긴급재난문자 API 테스트 스크립트
import fetch from 'node-fetch';

async function testDisasterAPI() {
  const serviceKey = process.env.EMERGENCY_MSG_API_KEY;
  
  if (!serviceKey) {
    console.error('❌ EMERGENCY_MSG_API_KEY 환경변수가 설정되지 않았습니다');
    return;
  }

  console.log('🔍 긴급재난문자 API 테스트 시작...');
  console.log('📡 API Key:', serviceKey ? '✅ 설정됨' : '❌ 없음');

  // 재난안전데이터공유플랫폼 API 호출
  const apiUrl = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-00247';
  const params = new URLSearchParams({
    serviceKey: serviceKey,
    returnType: 'json',
    pageNo: '1',
    numOfRows: '10'
  });

  try {
    console.log('📞 API 호출 중:', apiUrl);
    console.log('📋 파라미터:', params.toString());
    
    const response = await fetch(`${apiUrl}?${params}`);
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 응답 내용 (첫 500자):', responseText.substring(0, 500));
    
    // JSON 파싱 시도
    try {
      const data = JSON.parse(responseText);
      console.log('📋 파싱된 데이터 구조:', Object.keys(data));
      
      if (data.body && Array.isArray(data.body)) {
        console.log(`📨 총 ${data.body.length}개의 긴급재난문자 발견`);
        
        if (data.body.length > 0) {
          const latest = data.body[0];
          console.log('🚨 가장 최신 재난문자:');
          console.log('   - 발송시간:', latest.create_date || latest.snddt || '정보없음');
          console.log('   - 지역:', latest.location_name || latest.rcptn_rgnm || '정보없음');
          console.log('   - 내용:', latest.msg || latest.dsstr_msg || '정보없음');
        }
      } else {
        console.log('⚠️ body 필드가 배열이 아니거나 없습니다');
      }
      
    } catch (parseError) {
      console.log('❌ JSON 파싱 실패, XML 응답일 가능성:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
  }
}

testDisasterAPI();