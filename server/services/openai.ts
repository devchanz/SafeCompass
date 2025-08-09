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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "당신은 재난 안전 전문가로서 개인 맞춤형 안전 가이드를 제공합니다. 사용자의 특성을 고려한 실용적이고 구체적인 조언을 제공하세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      guide: result.guide || {
        primaryActions: ["안전한 곳으로 대피하세요"],
        safetyTips: ["침착함을 유지하세요"],
        specialConsiderations: ["주변에 도움을 요청하세요"],
        emergencyContacts: ["119에 신고하세요"]
      },
      audioText: result.audioText || "맞춤형 안전 가이드가 생성되었습니다.",
      estimatedReadingTime: result.estimatedReadingTime || 60
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("개인화된 가이드 생성에 실패했습니다: " + (error as Error).message);
  }
}
