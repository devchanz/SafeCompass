import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface PersonalizedGuideRequest {
  userProfile: {
    age: number;
    gender?: string;
    language: string;
    accessibility: string[];
    mobility: string;
    address: string;
  };
  situation: {
    disasterType: string;
    locationContext: string;
    canMove: boolean;
    gps?: { lat: number; lng: number };
  };
  relevantManuals: string[];
}

export interface PersonalizedGuideResponse {
  guide: {
    primaryActions: string[];
    safetyTips: string[];
    specialConsiderations: string[];
    emergencyContacts: string[];
  };
  audioText: string;
  estimatedReadingTime: number;
}

export async function generatePersonalizedGuide(
  request: PersonalizedGuideRequest
): Promise<PersonalizedGuideResponse> {
  try {
    const disasterTypeKo = request.situation.disasterType === 'earthquake' ? '지진' : 
                          request.situation.disasterType === 'fire' ? '화재' : request.situation.disasterType;
    
    const mobilityKo = request.userProfile.mobility === 'independent' ? '독립적 이동 가능' :
                      request.userProfile.mobility === 'assisted' ? '이동 지원 필요' : 
                      request.userProfile.mobility === 'unable' ? '이동 불가' : request.userProfile.mobility;

    const prompt = `
당신은 한국의 재난 안전 전문가입니다. 실제 ${disasterTypeKo} 상황에서 다음 사용자를 위한 초개인화된 생존 가이드를 생성해주세요.

=== 사용자 프로필 ===
- 나이: ${request.userProfile.age}세 (연령대별 신체능력과 인지능력 고려)
- 성별: ${request.userProfile.gender || '미상'}
- 언어: ${request.userProfile.language}
- 접근성 지원: ${request.userProfile.accessibility.join(', ')}
- 대피 능력: ${mobilityKo}
- 거주지: ${request.userProfile.address}

=== 현재 재난 상황 ===
- 재난 유형: ${disasterTypeKo}
- 현재 위치: ${request.situation.locationContext}
- 이동 가능성: ${request.situation.canMove ? '이동 가능' : '이동 어려움/불가능'}
- 재난 심각도: ${(request.situation as any).severity || 'critical'}
- 재난 분류: ${(request.situation as any).classification || '긴급재난'}
${(request.situation as any).magnitude ? `- 지진 규모: ${(request.situation as any).magnitude}` : ''}
- 재난 발생지: ${(request.situation as any).location}
${(request.situation as any).additionalInfo ? `- 추가 상황: ${(request.situation as any).additionalInfo}` : ''}

=== 맞춤형 가이드 생성 요구사항 ===
1. 사용자의 나이와 신체능력에 맞는 구체적인 행동 지침
2. 현재 위치(${request.situation.locationContext})에 특화된 대응 방법
3. 이동 가능성(${request.situation.canMove ? '가능' : '불가능'})을 고려한 실용적 조치
4. 접근성 지원사항(${request.userProfile.accessibility.join(', ')})에 맞춘 소통 방식
5. 한국의 실제 재난 대응 체계와 연계된 정보

다음 JSON 형식으로 응답해주세요:
{
  "guide": {
    "primaryActions": [
      "1단계: 즉시 실행해야 할 생명보호 행동",
      "2단계: 안전 확보 후 다음 행동",
      "3단계: 대피 또는 구조 요청 행동",
      "4단계: 추가 안전 확보 조치"
    ],
    "safetyTips": [
      "위치별 안전 수칙 1",
      "개인 특성 맞춤 안전 수칙 2", 
      "재난 유형별 주의사항 3"
    ],
    "specialConsiderations": [
      "나이 ${request.userProfile.age}세 고려사항",
      "이동능력 ${mobilityKo} 특별 고려사항",
      "접근성 ${request.userProfile.accessibility.join(', ')} 관련 주의사항"
    ],
    "emergencyContacts": [
      "119 (재난신고센터) - 즉시 연락",
      "지역 재난관리본부: 042-270-4119",
      "대전시 통합상황실: 042-270-2500",
      "가족 비상연락망 활성화"
    ]
  },
  "audioText": "${request.userProfile.age}세 ${request.userProfile.gender}분, 현재 ${request.situation.locationContext}에 계시는군요. ${disasterTypeKo}이 발생했으니 침착하게 들어주세요. 첫째로...",
  "estimatedReadingTime": 180
}

반드시 실제 한국 상황에 맞는 구체적이고 실용적인 조언을 제공하세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "당신은 재난 안전 전문가입니다. 사용자의 개인 정보와 현재 상황을 고려하여 맞춤형 지진 대응 가이드를 생성합니다. JSON 형식으로만 응답하세요."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      guide: {
        primaryActions: result.guide?.primaryActions || ["안전한 장소로 이동하세요", "주변 상황을 파악하세요"],
        safetyTips: result.guide?.safetyTips || ["침착함을 유지하세요", "머리를 보호하세요"],
        specialConsiderations: result.guide?.specialConsiderations || ["개인 안전을 최우선으로 하세요"],
        emergencyContacts: result.guide?.emergencyContacts || ["119 (소방서)", "112 (경찰서)"]
      },
      audioText: result.audioText || "즉시 안전한 장소로 이동하고 119에 신고하세요.",
      estimatedReadingTime: result.estimatedReadingTime || 30
    };
  } catch (error) {
    console.error("OpenAI API 호출 오류:", error);
    
    // Fallback response
    return {
      guide: {
        primaryActions: [
          "즉시 탁자 아래나 안전한 공간으로 대피하세요",
          "머리와 목을 보호하고 떨어질 수 있는 물건들로부터 멀리 떨어지세요",
          "흔들림이 멈추면 비상구를 통해 안전한 곳으로 대피하세요"
        ],
        safetyTips: [
          "엘리베이터는 절대 사용하지 마세요",
          "가스밸브를 잠그고 전기차단기를 내려주세요", 
          "라디오나 휴대폰으로 재해 상황을 확인하세요"
        ],
        specialConsiderations: request.userProfile.accessibility.includes('visual') 
          ? ["음성 안내에 집중하고 주변 사람들의 도움을 요청하세요"]
          : request.userProfile.accessibility.includes('hearing')
          ? ["시각적 신호와 진동을 통해 상황을 파악하세요"] 
          : ["주변 상황을 신속히 판단하고 행동하세요"],
        emergencyContacts: [
          "119 - 소방서 (화재, 구조)",
          "112 - 경찰서 (긴급상황)", 
          "재난안전종합상황실: 02-2100-5000"
        ]
      },
      audioText: request.userProfile.accessibility.includes('visual') 
        ? "지진이 발생했습니다. 즉시 탁자 아래로 들어가 머리를 보호하세요. 흔들림이 멈추면 안전한 곳으로 대피하고 주변 사람들에게 도움을 요청하세요."
        : "지진 발생! 즉시 안전한 곳으로 대피하고 머리를 보호하세요. 흔들림이 멈추면 119에 신고하고 안전한 장소로 이동하세요.",
      estimatedReadingTime: 45
    };
  }
}
