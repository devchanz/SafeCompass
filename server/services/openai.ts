import OpenAI from "openai";

// 다국어 프롬프트 생성 함수
function getMultilingualPrompts(language: string, disasterType: string) {
  const prompts: Record<string, any> = {
    ko: {
      systemRole: "당신은 재난 안전 전문가입니다. 사용자의 개인 정보와 현재 상황을 고려하여 맞춤형 재난 대응 가이드를 JSON 형식으로만 응답합니다. 예시나 템플릿 텍스트가 아닌 실제 개인화된 내용을 생성하세요."
    },
    en: {
      systemRole: "You are a disaster safety expert. Generate customized disaster response guides considering user's personal information and current situation. Respond only in JSON format. Do not use template or example text - provide actual personalized content."
    },
    vi: {
      systemRole: "Bạn là chuyên gia an toàn thảm họa. Tạo hướng dẫn ứng phó thảm họa tùy chỉnh dựa trên thông tin cá nhân và tình huống hiện tại của người dùng. Chỉ trả lời bằng định dạng JSON. Không sử dụng văn bản mẫu hoặc ví dụ - cung cấp nội dung được cá nhân hóa thực tế."
    },
    zh: {
      systemRole: "您是灾难安全专家。根据用户的个人信息和当前情况生成定制化的灾难应对指南。仅以JSON格式回复。不要使用模板或示例文本 - 提供实际个性化内容。"
    },
  };

  return prompts[language] || prompts["ko"];
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY_ENV_VAR ||
    "default_key",
});

export interface PersonalizedGuideRequest {
  userProfile: {
    age: number;
    gender?: string;
    language: string;
    accessibility: string[];
    mobility: "independent" | "assisted" | "unable";
    address: string;
  };
  situation: {
    locationContext: string;
    canMove: boolean;
    currentLocation?: { lat: number; lng: number };
    additionalInfo?: string;
  };
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
  kslKeywords?: string[]; // 한국수어 키워드
}

// 한국수어 지원을 위한 수어 키워드 추출
export function extractKSLKeywords(text: string, disasterType: string = 'unknown'): string[] {
  const kslDictionary = [
    '지진', '화재', '홍수', '태풍', '대피', '안전', '위험', '즉시', 
    '병원', '학교', '집', '밖으로', '아래로', '도움', '연락', '준비'
  ];

  // 텍스트에서 수어 단어 추출
  const foundKeywords = kslDictionary.filter(keyword => text.includes(keyword));
  
  // 재난 유형별 필수 키워드 추가
  const disasterKeywords: Record<string, string[]> = {
    'earthquake': ['지진', '대피', '안전'],
    'fire': ['화재', '대피', '위험'],
    'flood': ['홍수', '위험', '안전'],
    'typhoon': ['태풍', '위험', '준비']
  };

  const essentialKeywords = disasterKeywords[disasterType] || ['안전', '대피'];
  
  return Array.from(new Set([...foundKeywords, ...essentialKeywords])).slice(0, 5);
}

/**
 * OpenAI를 사용하여 사용자 맞춤형 재난 대응 가이드 생성
 */
export async function generatePersonalizedGuide(
  request: PersonalizedGuideRequest & { relevantManuals?: string[] },
): Promise<PersonalizedGuideResponse> {
  try {
    const disasterTypeKo = "지진";
    const mobilityKo =
      request.userProfile.mobility === "assisted"
        ? "이동 지원 필요"
        : request.userProfile.mobility === "unable"
          ? "이동 불가"
          : "독립적 이동 가능";

    // 사용자 언어에 맞는 프롬프트 생성
    const prompts = getMultilingualPrompts(
      request.userProfile.language,
      disasterTypeKo,
    );

    const userPrompt = `🚨 긴급 재난 상황 - 맞춤형 생명보호 가이드 요청

👤 사용자 정보:
- 나이: ${request.userProfile.age}세 (고령자/성인/청소년에 맞는 행동능력 고려)
- 성별: ${request.userProfile.gender || "미상"}  
- 이동능력: ${mobilityKo} (독립적/제한적/휠체어 등)
- 접근성 장애: ${request.userProfile.accessibility.join(", ") || "없음"} (시각/청각/신체 장애 고려)
- 현재 주소: ${request.userProfile.address}

🌍 재난 상황:
- 재난 유형: ${disasterTypeKo} (구체적 대응법 적용)
- 현재 위치: ${request.situation.locationContext} (건물 내부/외부/특수공간)
- 이동 가능성: ${request.situation.canMove ? "이동 가능" : "이동 제한"} (대피 전략 결정)

⚠️ 생명보호 우선 원칙에 따라 실제 개인화된 재난 대응 매뉴얼을 생성하세요:

✅ primaryActions: 각 단계별로 구체적이고 실행 가능한 행동 지침 (단순 단계명이나 예시 텍스트 절대 금지)
✅ safetyTips: ${request.userProfile.age}세 + ${request.userProfile.accessibility.join("/")} 장애 + ${mobilityKo} 특성을 반영한 실제적 안전 수칙  
✅ specialConsiderations: 사용자 개별 특성에 특화된 주의사항 (나이/장애/이동능력 구체적 고려)
✅ emergencyContacts: 한국 실정에 맞는 응급 연락처

📚 신뢰성 높은 정부기관 매뉴얼 기반 정보:
${request.relevantManuals?.map((manual, idx) => `${idx + 1}. ${manual}`).join('\n') || '기본 매뉴얼 적용'}

모든 내용은 실제 상황에서 즉시 실행할 수 있는 구체적이고 개인화된 지침이어야 합니다.
다음 JSON 형식으로 **${request.userProfile.language === "ko" ? "한국어" : request.userProfile.language === "en" ? "영어" : request.userProfile.language === "vi" ? "베트남어" : "중국어"}**로 응답해주세요:

{
  "guide": {
    "primaryActions": [
      "사용자 특성에 맞는 구체적 행동1",
      "사용자 특성에 맞는 구체적 행동2", 
      "사용자 특성에 맞는 구체적 행동3",
      "사용자 특성에 맞는 구체적 행동4"
    ],
    "safetyTips": [
      "${request.userProfile.age}세 ${request.userProfile.accessibility.join(",")} 장애 고려한 안전수칙",
      "${mobilityKo} 이동능력 반영한 맞춤 지침",
      "지진 재난 특성 기반 실행가능한 주의사항"
    ],
    "specialConsiderations": [
      "${request.userProfile.age}세 고령자/성인/청소년 특별 고려사항",
      "${request.userProfile.accessibility.join("/")} 장애 특화 주의사항", 
      "${mobilityKo} 이동 특성 반영한 대피 전략"
    ],
    "emergencyContacts": [
      "119 (재난신고센터) - 즉시 연락",
      "가족/동행파트너 비상 연락망 활성화"
    ]
  },
  "audioText": "사용자 개인 특성을 반영한 상세 음성 안내",
  "estimatedReadingTime": 180
}

⚠️ 중요: 위 JSON 구조는 참고용이며, 실제 내용은 사용자의 나이(${request.userProfile.age}세), 이동능력(${mobilityKo}), 접근성 요구사항(${request.userProfile.accessibility.join(", ") || "없음"})을 반영한 구체적이고 실용적인 개인화된 조언을 제공하세요. 예시 텍스트를 그대로 반환하지 마세요.`;

    console.log("🤖 OpenAI API 호출 시작:", {
      model: "gpt-4o",
      promptLength: userPrompt.length,
      userAge: request.userProfile.age,
      userLanguage: request.userProfile.language,
      disasterType: disasterTypeKo,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for better personalization
      messages: [
        {
          role: "system",
          content: prompts.systemRole,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    console.log("✅ OpenAI API 응답 수신:", {
      choices: response.choices.length,
      contentLength: response.choices[0].message.content?.length || 0,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI 응답이 비어있습니다");
    }

    let result: PersonalizedGuideResponse;
    try {
      const parsedContent = JSON.parse(content);
      console.log("🔍 파싱된 응답 구조:", JSON.stringify(parsedContent, null, 2));
      
      // OpenAI 응답 구조가 예상과 다를 수 있으므로 확인 후 변환
      if (parsedContent.guide) {
        result = parsedContent;
      } else {
        // 직접 가이드 내용만 있는 경우 래핑
        result = {
          guide: parsedContent,
          audioText: parsedContent.audioText || "지진이 발생했습니다. 즉시 대피하세요.",
          estimatedReadingTime: parsedContent.estimatedReadingTime || 3
        };
      }
    } catch (parseError) {
      console.error("❌ JSON 파싱 오류:", parseError);
      console.log("원본 응답:", content);
      
      // 파싱 실패시 기본 응답 구조 반환
      result = {
        guide: {
          primaryActions: [
            "즉시 머리와 목을 보호하세요",
            "튼튼한 테이블 아래로 피하세요", 
            "흔들림이 멈출 때까지 기다리세요",
            "안전한 경로로 대피하세요"
          ],
          safetyTips: [
            "엘리베이터를 사용하지 마세요",
            "계단을 이용해 천천히 대피하세요",
            "낙하물에 주의하세요"
          ],
          specialConsiderations: [
            "개인 이동 능력에 따른 대피",
            "주변 도움 요청하기",
            "비상용품 준비"
          ],
          emergencyContacts: ["119", "112", "1588-3650"]
        },
        audioText: "지진이 발생했습니다. 즉시 대피하세요.",
        estimatedReadingTime: 2
      };
    }

    return result;
  } catch (error) {
    console.error("❌ OpenAI API 호출 오류:", error);
    throw error;
  }
}

/**
 * API 테스트용 함수
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  message: string;
  result?: string;
  error?: string;
  usage?: any;
}> {
  try {
    console.log("🔧 OpenAI API 테스트 시작...");
    console.log("🔧 API Key 존재 여부:", !!process.env.OPENAI_API_KEY);
    console.log(
      "🔧 API Key 앞 10자리:",
      process.env.OPENAI_API_KEY?.substring(0, 10),
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: "테스트용 간단한 응답을 해주세요.",
        },
      ],
      max_tokens: 10,
    });

    console.log("✅ OpenAI API 테스트 성공");
    return {
      success: true,
      message: "OpenAI API 호출 성공",
      result: response.choices[0].message.content || "테스트 성공",
      usage: response.usage,
    };
  } catch (error: any) {
    console.error("❌ OpenAI API 테스트 실패:", error);
    return {
      success: false,
      message: "OpenAI API 호출 실패",
      error: error.message,
      usage: null,
    };
  }
}
