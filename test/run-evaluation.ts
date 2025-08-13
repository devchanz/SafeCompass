import * as fs from 'fs';
import * as path from 'path';

// --- 설정 --- //
const API_ENDPOINT = 'http://localhost:5000/api/pdf/search';
const TEST_DATA_PATH = path.join(process.cwd(), 'test', 'rag-evaluation.json');
const TOP_K = 5; // Hit Rate 계산 시 상위 몇 개까지의 결과를 확인할 것인지 설정

// --- 타입 정의 --- //
interface TestCase {
  id: string;
  query: string;
  groundTruthDocId: string | null;
}

interface Result {
  id: string;
  query: string;
  hit: boolean;
  rank: number | null;
  reciprocalRank: number;
  topResult: string;
  topResultConfidence: number | null;
}

// --- 메인 함수 --- //
async function runEvaluation() {
  console.log('RAG 성능 평가 자동화를 시작합니다...');

  let testCases: TestCase[];
  try {
    const fileContent = fs.readFileSync(TEST_DATA_PATH, 'utf-8');
    testCases = JSON.parse(fileContent);
  } catch (error) {
    console.error(`오류: 테스트 데이터 파일(${TEST_DATA_PATH})을 읽을 수 없습니다.`);
    return;
  }

  const results: Result[] = [];
  let totalReciprocalRank = 0;
  let totalHits = 0;

  for (const testCase of testCases) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testCase.query, disasterType: 'earthquake' }),
      });

      if (!response.ok) {
        console.warn(`[${testCase.id}] API 요청 실패: ${response.statusText}`);
        continue;
      }

      const apiResult = await response.json();
      const retrievedDocs = apiResult.results || [];

      let hit = false;
      let rank: number | null = null;
      let reciprocalRank = 0;

      if (testCase.groundTruthDocId === null) {
        // OOD (Out-of-Domain) 질문: 정답이 없어야 함
        // 검색 결과가 없거나, 최상위 결과의 신뢰도가 매우 낮으면 성공으로 간주
        if (retrievedDocs.length === 0 || retrievedDocs[0].confidence < 0.3) {
          hit = true;
        }
        rank = null; // OOD는 순위가 없음
        reciprocalRank = hit ? 1 : 0; // OOD는 성공 시 1점, 실패 시 0점
      } else {
        // 일반 질문: 정답 문서의 순위를 찾음
        const foundIndex = retrievedDocs.findIndex((doc: any) => 
          doc.title.startsWith(testCase.groundTruthDocId)
        );

        if (foundIndex !== -1 && foundIndex < TOP_K) {
          hit = true;
          rank = foundIndex + 1;
          reciprocalRank = 1 / rank;
        }
      }

      totalHits += hit ? 1 : 0;
      totalReciprocalRank += reciprocalRank;

      results.push({
        id: testCase.id,
        query: testCase.query.substring(0, 30) + '...',
        hit,
        rank,
        reciprocalRank: parseFloat(reciprocalRank.toFixed(2)),
        topResult: retrievedDocs.length > 0 ? retrievedDocs[0].title.substring(0, 30) + '...' : 'N/A',
        topResultConfidence: retrievedDocs.length > 0 ? parseFloat(retrievedDocs[0].confidence.toFixed(2)) : null,
      });

    } catch (error) {
      console.warn(`[${testCase.id}] 처리 중 오류 발생:`, error);
    }
    // API 과부하 방지를 위한 약간의 딜레이
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // --- 결과 출력 --- //
  printResults(results, testCases.length, totalHits, totalReciprocalRank);
}

function printResults(results: Result[], totalCount: number, totalHits: number, totalRR: number) {
  console.log('\n--- 개별 테스트 결과 ---');
  console.table(results);

  console.log('\n--- 평가 실패 케이스 ---');
  const failedCases = results.filter(r => !r.hit);
  if (failedCases.length > 0) {
    console.table(failedCases.map(r => ({ ID: r.id, Query: r.query, TopResult: r.topResult, Confidence: r.topResultConfidence })));
  } else {
    console.log('모든 테스트 케이스를 통과했습니다!');
  }

  console.log('\n--- 최종 성능 지표 ---');
  const hitRate = (totalHits / totalCount) * 100;
  const mrr = totalRR / totalCount;

  console.log(`- 총 질문 수: ${totalCount}개`);
  console.log(`- Hit Rate (@${TOP_K}): ${hitRate.toFixed(2)}%`);
  console.log(`- MRR (Mean Reciprocal Rank): ${mrr.toFixed(3)}`);
  console.log('------------------------');
}

runEvaluation();
