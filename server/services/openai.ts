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
    const prompt = `
당신은 재난 안전 전문가입니다. 다음 정보를 바탕으로 개인 맞춤형 지진 대응 가이드를 생성해주세요.

사용자 프로필:
- 나이: ${request.userProfile.age}세
- 성별: ${request.userProfile.gender || '미상'}
- 언어: ${request.userProfile.language}
- 접근성 지원: ${request.userProfile.accessibility.join(', ')}
- 대피 능력: ${request.userProfile.mobility}
- 주소: ${request.userProfile.address}

현재 상황:
- 재난 유형: ${request.situation.disasterType}
- 위치: ${request.situation.locationContext}
- 이동 가능성: ${request.situation.canMove ? '가능' : '어려움'}

관련 매뉴얼 내용:
${request.relevantManuals.join('\n\n')}

다음 JSON 형식으로 응답해주세요:
{
  "guide": {
    "primaryActions": ["즉시 행동 사항 1", "즉시 행동 사항 2", ...],
    "safetyTips": ["안전 수칙 1", "안전 수칙 2", ...],
    "specialConsiderations": ["특별 주의사항 1", "특별 주의사항 2", ...],
    "emergencyContacts": ["연락처 정보 1", "연락처 정보 2", ...]
  },
  "audioText": "음성 안내용 전체 텍스트",
  "estimatedReadingTime": 예상_읽기_시간_초
}

중요: 사용자의 나이, 접근성 필요사항, 대피 능력을 반드시 고려하여 맞춤형 조언을 제공하세요.
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
