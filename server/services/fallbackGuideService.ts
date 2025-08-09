export interface FallbackGuideRequest {
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
}

interface GuideStep {
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export class FallbackGuideService {
  private baseGuides = {
    korean: {
      earthquake: {
        independent: {
          indoor: [
            {
              title: "즉시 머리 보호",
              description: "책상 아래나 튼튼한 가구 밑으로 들어가 머리와 목을 보호하세요.",
              icon: "fas fa-shield-alt",
              priority: "high" as const
            },
            {
              title: "진동이 멈출 때까지 대기",
              description: "흔들림이 완전히 멈출 때까지 안전한 곳에서 기다리세요.",
              icon: "fas fa-clock",
              priority: "high" as const
            },
            {
              title: "안전한 경로로 대피",
              description: "엘리베이터는 절대 사용하지 말고 계단을 이용해 대피하세요.",
              icon: "fas fa-running",
              priority: "medium" as const
            }
          ],
          outdoor: [
            {
              title: "건물과 전선에서 멀어지기",
              description: "건물, 전선, 가로등에서 최대한 멀리 떨어진 넓은 공간으로 이동하세요.",
              icon: "fas fa-exclamation-triangle",
              priority: "high" as const
            },
            {
              title: "낙하물 주의",
              description: "머리 위 간판이나 유리창 등 낙하 위험이 있는 곳을 피하세요.",
              icon: "fas fa-hard-hat",
              priority: "high" as const
            }
          ]
        },
        assisted: {
          indoor: [
            {
              title: "주변 도움 요청",
              description: "큰 소리로 도움을 요청하고 휴대폰으로 긴급전화를 하세요.",
              icon: "fas fa-phone",
              priority: "high" as const
            },
            {
              title: "안전한 위치 확보",
              description: "튼튼한 가구 옆에서 몸을 웅크리고 머리를 보호하세요.",
              icon: "fas fa-shield-alt",
              priority: "high" as const
            }
          ]
        },
        unable: [
          {
            title: "즉시 구조 신호",
            description: "휴대폰, 호루라기 등을 이용해 구조 신호를 보내세요.",
            icon: "fas fa-bullhorn",
            priority: "high" as const
          },
          {
            title: "현재 위치에서 안전 확보",
            description: "움직이지 말고 현재 위치에서 최대한 안전을 확보하세요.",
            icon: "fas fa-map-marker-alt",
            priority: "high" as const
          }
        ]
      }
    },
    english: {
      earthquake: {
        independent: {
          indoor: [
            {
              title: "Protect Your Head Immediately",
              description: "Get under a desk or sturdy furniture to protect your head and neck.",
              icon: "fas fa-shield-alt",
              priority: "high" as const
            },
            {
              title: "Wait Until Shaking Stops",
              description: "Stay in a safe place until the shaking completely stops.",
              icon: "fas fa-clock",
              priority: "high" as const
            },
            {
              title: "Evacuate via Safe Route",
              description: "Never use elevators. Use stairs to evacuate the building.",
              icon: "fas fa-running",
              priority: "medium" as const
            }
          ],
          outdoor: [
            {
              title: "Move Away from Buildings",
              description: "Move to an open area away from buildings, power lines, and streetlights.",
              icon: "fas fa-exclamation-triangle",
              priority: "high" as const
            },
            {
              title: "Watch for Falling Objects",
              description: "Avoid areas with signs, glass windows, or other falling hazards.",
              icon: "fas fa-hard-hat",
              priority: "high" as const
            }
          ]
        }
      }
    }
  };

  generatePersonalizedGuide(request: FallbackGuideRequest): string {
    const { userProfile, situation } = request;
    const language = userProfile.language === 'english' ? 'english' : 'korean';
    const mobility = userProfile.mobility || 'independent';
    const location = situation.locationContext.includes('실내') || situation.locationContext.includes('indoor') ? 'indoor' : 'outdoor';
    
    // Get base guide steps
    const baseSteps = this.baseGuides[language]?.earthquake?.[mobility]?.[location] || 
                     this.baseGuides[language]?.earthquake?.independent?.indoor || [];
    
    // Personalize based on user profile
    let personalizedSteps = [...baseSteps];
    
    // Add accessibility-specific guidance
    if (userProfile.accessibility?.includes('visual')) {
      personalizedSteps.unshift({
        title: language === 'korean' ? "음성 안내 활성화" : "Activate Voice Guidance",
        description: language === 'korean' ? 
          "휴대폰의 음성 안내 기능을 켜고 주변 상황을 파악하세요." :
          "Turn on your phone's voice guidance to assess your surroundings.",
        icon: "fas fa-volume-up",
        priority: "high" as const
      });
    }
    
    if (userProfile.accessibility?.includes('hearing')) {
      personalizedSteps.unshift({
        title: language === 'korean' ? "시각적 신호 확인" : "Check Visual Signals",
        description: language === 'korean' ? 
          "진동이나 시각적 경고 신호를 주의 깊게 관찰하세요." :
          "Carefully observe vibrations and visual warning signals.",
        icon: "fas fa-eye",
        priority: "high" as const
      });
    }
    
    // Add age-specific guidance
    if (userProfile.age >= 65) {
      personalizedSteps.push({
        title: language === 'korean' ? "천천히 행동하기" : "Move Slowly and Carefully",
        description: language === 'korean' ? 
          "서두르지 말고 안전을 확인하며 천천히 행동하세요." :
          "Don't rush. Take your time and ensure safety with each movement.",
        icon: "fas fa-walking",
        priority: "medium" as const
      });
    }
    
    // Generate final guide text
    const title = language === 'korean' ? 
      `${userProfile.address} 지역 맞춤 지진 대응 가이드` :
      `Customized Earthquake Response Guide for ${userProfile.address}`;
      
    const intro = language === 'korean' ?
      `${userProfile.age}세, ${userProfile.mobility === 'independent' ? '자력대피 가능' : userProfile.mobility === 'assisted' ? '부분 도움 필요' : '자력대피 불가'}한 상황에 맞는 대응 방법입니다.` :
      `Response guide for ${userProfile.age} years old, ${userProfile.mobility === 'independent' ? 'able to self-evacuate' : userProfile.mobility === 'assisted' ? 'needs partial assistance' : 'unable to self-evacuate'}.`;
    
    let guideText = `# ${title}\n\n${intro}\n\n`;
    
    personalizedSteps.forEach((step, index) => {
      guideText += `## ${index + 1}. ${step.title}\n`;
      guideText += `${step.description}\n\n`;
    });
    
    // Add emergency contacts
    const contacts = language === 'korean' ?
      "## 긴급연락처\n- 119: 소방서\n- 112: 경찰서\n- 1588-3650: 재난신고" :
      "## Emergency Contacts\n- 119: Fire Department\n- 112: Police\n- 1588-3650: Disaster Report";
      
    guideText += contacts;
    
    return guideText;
  }
}