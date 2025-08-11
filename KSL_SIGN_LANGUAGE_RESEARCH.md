# 한국수어(KSL) 청각 접근성 지원 연구 보고서

## 현재 상황 분석

### 1. 한국수어 번역 API 현황
- **상용 API 부재**: 상업적으로 사용 가능한 한국수어 번역 API 없음
- **연구 단계**: 대부분의 KSL 기술이 학술 연구 단계에 머물러 있음
- **ASL과의 격차**: 미국수어(ASL)에 비해 기술적 성숙도 상당한 차이

### 2. 활용 가능한 자원

#### 공식 자원
- **국립국어원 한국수어사전** (https://sldict.korean.go.kr)
  - 정부 공인 한국수어 표준 사전
  - 단어별 수어 영상 제공
  - 개발자 API는 현재 미제공

#### 연구 데이터셋
- **KSL-Guide Dataset** (ChelseaGH/KSL-Guide)
  - 121,000개 비디오 샘플
  - 네이티브 한국수어 화자 데이터
  - 2D/3D 포즈 키포인트 포함

- **KSL Dataset** (Yangseung/KSL)
  - 77개 단어, 1,229개 비디오
  - 112,564 프레임 데이터

### 3. 기술적 접근 방법

#### Option 1: 기본 단어 수어 사전 (즉시 구현 가능)
```javascript
// 기본 KSL 단어 매핑
const kslDictionary = {
  "지진": "/videos/ksl/earthquake.mp4",
  "대피": "/videos/ksl/evacuate.mp4",
  "안전": "/videos/ksl/safety.mp4",
  "병원": "/videos/ksl/hospital.mp4"
};

function getKSLVideo(word) {
  return kslDictionary[word] || null;
}
```

#### Option 2: 3D 아바타 시스템 (중기 개발)
```javascript
// 3D 수어 아바타 (Three.js 기반)
import * as THREE from 'three';

class KSLAvatar {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.avatar = null;
    this.animations = new Map();
  }
  
  async performSign(word) {
    const animation = this.animations.get(word);
    if (animation) {
      await this.playAnimation(animation);
    }
  }
}
```

#### Option 3: AI 기반 실시간 번역 (장기 개발)
```python
# MediaPipe + TensorFlow 기반
import mediapipe as mp
import tensorflow as tf

class KSLTranslator:
    def __init__(self):
        self.hands = mp.solutions.hands.Hands()
        self.model = tf.keras.models.load_model('ksl_model.h5')
    
    def text_to_ksl(self, text):
        # 텍스트를 수어 시퀀스로 변환
        pass
```

## 실용적 구현 방안

### 단계별 접근법

#### 1단계: 기본 수어 비디오 라이브러리 (1-2주)
- 핵심 재난 용어 50-100개 수어 비디오 수집
- 국립국어원 한국수어사전에서 허가받아 사용
- 웹 인터페이스에 비디오 플레이어 통합

#### 2단계: 문장 구성 시스템 (1-2개월)  
- 단어별 수어를 조합하여 문장 구성
- 한국수어 문법 규칙 적용
- 순서: 시간-장소-주어-목적어-동사

#### 3단계: 3D 아바타 도입 (3-6개월)
- Ready Player Me 또는 VRM 아바타 사용
- 기본 수어 동작 애니메이션 제작
- Three.js 기반 웹 렌더링

## 추천 구현 방법

### 즉시 적용 가능한 솔루션

```typescript
// 긴급상황 KSL 지원 컴포넌트
interface KSLSupportProps {
  message: string;
  isHearingImpaired: boolean;
}

const KSLSupport: React.FC<KSLSupportProps> = ({ message, isHearingImpaired }) => {
  const [kslVideo, setKslVideo] = useState<string | null>(null);
  
  useEffect(() => {
    if (isHearingImpaired) {
      // 메시지를 핵심 단어로 분해
      const keywords = extractKeywords(message);
      
      // 각 단어에 대한 수어 비디오 검색
      const videoSequence = keywords.map(word => getKSLVideo(word));
      setKslVideo(videoSequence);
    }
  }, [message, isHearingImpaired]);

  if (!isHearingImpaired || !kslVideo) return null;

  return (
    <div className="ksl-support-panel">
      <h3>🤟 한국수어 안내</h3>
      <div className="ksl-video-container">
        {kslVideo.map((video, index) => (
          <video key={index} autoPlay muted loop>
            <source src={video} type="video/mp4" />
          </video>
        ))}
      </div>
      <p className="ksl-text">{message}</p>
    </div>
  );
};
```

### 비용 효율적 접근법

1. **기본 구현**: 핵심 재난 용어 수어 비디오 50개 
   - 개발 시간: 2-3주
   - 비용: 무료 (공공 자원 활용)

2. **확장 구현**: 문장 조합 시스템
   - 개발 시간: 2-3개월  
   - 비용: 개발 비용만

3. **고급 구현**: AI 기반 실시간 번역
   - 개발 시간: 6-12개월
   - 비용: 상당한 AI 개발 투자 필요

## 결론 및 권장사항

### 즉시 적용 가능한 방법
1. **국립국어원 한국수어사전 API 문의**
2. **기본 재난 용어 수어 비디오 라이브러리 구축**
3. **사용자 청각 접근성 프로필에 따른 수어 비디오 자동 재생**

### 장기 발전 방향
1. **학계 협력을 통한 KSL 번역 모델 개발**
2. **정부 지원 사업 참여 고려**
3. **청각장애인 커뮤니티와의 협업**

이 방법으로 단계적으로 한국수어 지원을 추가할 수 있으며, 처음에는 기본적인 비디오 기반 접근으로 시작하여 점진적으로 고도화할 수 있습니다.