import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface KSLSupportProps {
  message: string;
  isHearingImpaired: boolean;
  disasterType?: string;
}

// 긴급재난 상황 한국수어 기본 사전
const KSL_EMERGENCY_DICTIONARY: Record<string, {
  video: string;
  description: string;
  fallbackText: string;
}> = {
  // 재난 유형
  '지진': {
    video: '/videos/ksl/earthquake.mp4',
    description: '지진 - 양손을 좌우로 흔들며 땅이 흔들리는 모습',
    fallbackText: '🏠➡️📳 (건물이 흔들림)'
  },
  '화재': {
    video: '/videos/ksl/fire.mp4', 
    description: '화재 - 양손을 위로 올리며 불꽃 모양',
    fallbackText: '🔥🚨 (불이 남)'
  },
  '홍수': {
    video: '/videos/ksl/flood.mp4',
    description: '홍수 - 손으로 물이 올라오는 모습',
    fallbackText: '🌊⬆️ (물이 올라옴)'
  },
  
  // 행동 지시
  '대피': {
    video: '/videos/ksl/evacuate.mp4',
    description: '대피 - 손으로 나가는 방향을 가리킴',
    fallbackText: '🏃‍♂️➡️🚪 (빨리 나가세요)'
  },
  '안전': {
    video: '/videos/ksl/safety.mp4',
    description: '안전 - 양손을 교차하여 가슴에 대는 모습',
    fallbackText: '✅🛡️ (안전함)'
  },
  '위험': {
    video: '/videos/ksl/danger.mp4',
    description: '위험 - 양손을 앞으로 내밀며 정지 신호',
    fallbackText: '⚠️🛑 (위험함)'
  },
  '즉시': {
    video: '/videos/ksl/immediately.mp4',
    description: '즉시 - 손가락으로 빠르게 신호',
    fallbackText: '⚡🏃‍♂️ (지금 당장)'
  },
  
  // 장소
  '병원': {
    video: '/videos/ksl/hospital.mp4',
    description: '병원 - 십자가 모양을 손으로 표현',
    fallbackText: '🏥➕ (병원)'
  },
  '학교': {
    video: '/videos/ksl/school.mp4',
    description: '학교 - 책 읽는 모습',
    fallbackText: '🏫📚 (학교)'
  },
  '집': {
    video: '/videos/ksl/home.mp4',
    description: '집 - 지붕 모양을 손으로 표현',
    fallbackText: '🏠🏡 (집)'
  }
};

// 문장에서 핵심 단어 추출
const extractKeywords = (text: string): string[] => {
  const keywords = Object.keys(KSL_EMERGENCY_DICTIONARY);
  return keywords.filter(keyword => text.includes(keyword));
};

// 재난 유형별 핵심 수어 단어 매핑
const getDisasterKeywords = (disasterType: string): string[] => {
  const mapping: Record<string, string[]> = {
    'earthquake': ['지진', '대피', '안전', '즉시'],
    'fire': ['화재', '대피', '위험', '즉시'],
    'flood': ['홍수', '위험', '안전', '대피'],
    'typhoon': ['태풍', '위험', '안전', '집']
  };
  
  return mapping[disasterType] || ['위험', '안전', '대피'];
};

const KSLSupport: React.FC<KSLSupportProps> = ({ 
  message, 
  isHearingImpaired, 
  disasterType 
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isHearingImpaired) {
      // 메시지에서 핵심 단어 추출
      const messageKeywords = extractKeywords(message);
      
      // 재난 유형별 추가 단어
      const disasterKeywords = disasterType ? getDisasterKeywords(disasterType) : [];
      
      // 중복 제거하여 통합
      const allKeywords = Array.from(new Set([...messageKeywords, ...disasterKeywords]));
      setSelectedWords(allKeywords.slice(0, 5)); // 최대 5개 단어
    }
  }, [message, isHearingImpaired, disasterType]);

  const playKSLSequence = () => {
    setIsPlaying(true);
    setCurrentWordIndex(0);
    
    // 각 단어를 순차적으로 보여줌 (3초씩)
    selectedWords.forEach((_, index) => {
      setTimeout(() => {
        setCurrentWordIndex(index);
        if (index === selectedWords.length - 1) {
          setTimeout(() => setIsPlaying(false), 3000);
        }
      }, index * 3000);
    });
  };

    if (isHearingImpaired) {
    return null;
  }

  // If no words are selected, also return null to avoid rendering an empty component
  if (selectedWords.length === 0) {
    return null;
  }

  const currentWord = selectedWords[currentWordIndex];
  const currentKSL = currentWord ? KSL_EMERGENCY_DICTIONARY[currentWord] : null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🤟</span>
        </div>
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          한국수어 안내
        </h3>
      </div>

      {/* 수어 단어 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {selectedWords.map((word, index) => (
          <div
            key={word}
            className={`p-3 rounded-lg border text-center transition-all ${
              isPlaying && index === currentWordIndex
                ? 'bg-blue-600 text-white border-blue-600 scale-105'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-2xl mb-1">
              {(KSL_EMERGENCY_DICTIONARY as any)[word]?.fallbackText || '🤟'}
            </div>
            <div className="text-sm font-medium">{word}</div>
          </div>
        ))}
      </div>

      {/* 현재 재생 중인 수어 */}
      {isPlaying && currentKSL && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border-2 border-blue-500">
          <div className="text-center">
            <div className="text-4xl mb-2">{currentKSL.fallbackText}</div>
            <div className="text-lg font-semibold mb-1">{currentWord}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentKSL.description}
            </div>
          </div>
          
          {/* 진행 표시 */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>진행: {currentWordIndex + 1}/{selectedWords.length}</span>
              <span>3초 표시</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-3000"
                style={{ 
                  width: `${((currentWordIndex + 1) / selectedWords.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="flex gap-3">
        <Button
          onClick={playKSLSequence}
          disabled={isPlaying}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPlaying ? (
            <>
              <span className="mr-2">⏸️</span>
              수어 재생 중...
            </>
          ) : (
            <>
              <span className="mr-2">▶️</span>
              수어 보기
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsPlaying(false)}
          disabled={!isPlaying}
          className="px-4"
        >
          ⏹️
        </Button>
      </div>

      {/* 원본 메시지 */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">원본 메시지:</div>
        <div className="text-sm">{message}</div>
      </div>

      {/* 추가 안내 */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 수어 비디오는 향후 업데이트로 제공될 예정입니다
      </div>
    </div>
  );
};

export default KSLSupport;