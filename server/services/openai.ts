import OpenAI from "openai";

// 다국어 프롬프트 생성 함수
function getMultilingualPrompts(language: string, disasterType: string) {
  const prompts: Record<string, any> = {
    ko: {
      systemRole: "당신은 재난 안전 전문가입니다. 사용자의 개인 정보와 현재 상황을 고려하여 맞춤형 재난 대응 가이드를 생성합니다. JSON 형식으로만 응답하세요.",
      jsonFormat: `{
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
      "나이 고려사항",
      "이동능력 특별 고려사항", 
      "접근성 관련 주의사항"
    ],
    "emergencyContacts": [
      "119 (재난신고센터) - 즉시 연락",
      "지역 재난관리본부: 042-270-4119",
      "대전시 통합상황실: 042-270-2500",
      "가족 비상연락망 활성화"
    ]
  },
  "audioText": "안전 가이드 음성 텍스트",
  "estimatedReadingTime": 180
}`
    },
    en: {
      systemRole: "You are a disaster safety expert. Generate customized disaster response guides considering user's personal information and current situation. Respond only in JSON format.",
      jsonFormat: `{
  "guide": {
    "primaryActions": [
      "Step 1: Immediate life-protection actions to execute",
      "Step 2: Next actions after securing safety",
      "Step 3: Evacuation or rescue request actions", 
      "Step 4: Additional safety securing measures"
    ],
    "safetyTips": [
      "Location-specific safety rule 1",
      "Personal characteristic-customized safety rule 2",
      "Disaster type-specific precaution 3"
    ],
    "specialConsiderations": [
      "Age considerations",
      "Mobility special considerations",
      "Accessibility-related precautions"
    ],
    "emergencyContacts": [
      "119 (Disaster Report Center) - Call immediately", 
      "Regional Disaster Management: 042-270-4119",
      "Daejeon Integrated Situation Room: 042-270-2500",
      "Activate family emergency contacts"
    ]
  },
  "audioText": "Safety guide audio text",
  "estimatedReadingTime": 180
}`
    },
    vi: {
      systemRole: "Bạn là chuyên gia an toàn thảm họa. Tạo hướng dẫn ứng phó thảm họa tùy chỉnh dựa trên thông tin cá nhân và tình huống hiện tại của người dùng. Chỉ trả lời bằng định dạng JSON.",
      jsonFormat: `{
  "guide": {
    "primaryActions": [
      "Bước 1: Hành động bảo vệ sinh mạng cần thực hiện ngay lập tức",
      "Bước 2: Hành động tiếp theo sau khi đảm bảo an toàn",
      "Bước 3: Hành động sơ tán hoặc yêu cầu cứu hộ",
      "Bước 4: Các biện pháp đảm bảo an toàn bổ sung"
    ],
    "safetyTips": [
      "Quy tắc an toàn cụ thể theo vị trí 1",
      "Quy tắc an toàn tùy chỉnh theo đặc điểm cá nhân 2", 
      "Lưu ý cụ thể theo loại thảm họa 3"
    ],
    "specialConsiderations": [
      "Cân nhắc về tuổi tác",
      "Cân nhắc đặc biệt về khả năng di chuyển",
      "Lưu ý liên quan đến khả năng tiếp cận"
    ],
    "emergencyContacts": [
      "119 (Trung tâm Báo cáo Thảm họa) - Gọi ngay lập tức",
      "Quản lý Thảm họa Khu vực: 042-270-4119", 
      "Phòng Tình huống Tổng hợp Daejeon: 042-270-2500",
      "Kích hoạt mạng liên lạc khẩn cấp gia đình"
    ]
  },
  "audioText": "Văn bản âm thanh hướng dẫn an toàn", 
  "estimatedReadingTime": 180
}`
    },
    zh: {
      systemRole: "您是灾难安全专家。根据用户的个人信息和当前情况生成定制化的灾难应对指南。仅以JSON格式回复。",
      jsonFormat: `{
  "guide": {
    "primaryActions": [
      "第1步：需要立即执行的生命保护行动",
      "第2步：确保安全后的下一步行动",
      "第3步：疏散或请求救援的行动", 
      "第4步：额外的安全确保措施"
    ],
    "safetyTips": [
      "按位置划分的安全规则1",
      "根据个人特征定制的安全规则2",
      "按灾难类型划分的注意事项3" 
    ],
    "specialConsiderations": [
      "年龄考虑因素",
      "行动能力特殊考虑因素",
      "无障碍相关注意事项"
    ],
    "emergencyContacts": [
      "119（灾难报告中心）- 立即拨打",
      "区域灾难管理：042-270-4119",
      "大田综合情况室：042-270-2500", 
      "启动家庭紧急联系网络"
    ]
  },
  "audioText": "安全指南音频文本",
  "estimatedReadingTime": 180
}`
    }
  };

  return prompts[language] || prompts['ko'];
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
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
}

/**
 * OpenAI를 사용하여 사용자 맞춤형 재난 대응 가이드 생성
 */
export async function generatePersonalizedGuide(
  request: PersonalizedGuideRequest
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
    const prompts = getMultilingualPrompts(request.userProfile.language, disasterTypeKo);
    
    const userPrompt = `사용자 프로필:
- 나이: ${request.userProfile.age}세
- 성별: ${request.userProfile.gender || "미상"}
- 언어: ${request.userProfile.language}
- 접근성 지원: ${request.userProfile.accessibility.join(", ") || "없음"}
- 대피 능력: ${mobilityKo}
- 거주지: ${request.userProfile.address}

현재 재난 상황:
- 재난 유형: ${disasterTypeKo}
- 현재 위치: ${request.situation.locationContext}
- 이동 가능성: ${request.situation.canMove ? "이동 가능" : "이동 어려움/불가능"}
- 추가 상황: ${request.situation.additionalInfo || "없음"}

위 정보를 바탕으로 다음 JSON 형식으로 **${request.userProfile.language === 'ko' ? '한국어' : request.userProfile.language === 'en' ? '영어' : request.userProfile.language === 'vi' ? '베트남어' : '중국어'}**로 응답해주세요:

${prompts.jsonFormat}

사용자의 나이, 이동능력, 언어, 접근성 요구사항을 반영한 구체적이고 실용적인 조언을 제공하세요.`;

    console.log("🤖 OpenAI API 호출 시작:", {
      model: "gpt-4o",
      promptLength: userPrompt.length,
      userAge: request.userProfile.age,
      userLanguage: request.userProfile.language,
      disasterType: disasterTypeKo,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      result = JSON.parse(content);
    } catch (parseError) {
      console.error("❌ JSON 파싱 오류:", parseError);
      console.log("원본 응답:", content);
      throw new Error("OpenAI 응답을 JSON으로 파싱할 수 없습니다");
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
    console.log("🔧 API Key 앞 10자리:", process.env.OPENAI_API_KEY?.substring(0, 10));

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