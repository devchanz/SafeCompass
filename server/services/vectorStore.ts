/**
 * 벡터 저장소 서비스
 * PDF 문서를 임베딩하여 RAG 검색을 위한 벡터 데이터베이스 구축
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

export interface ManualDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  disasterType: string;
  category: string;
  confidence: number;
}

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    title: string;
    disasterType: string;
    category: string;
    source: string;
    chunkIndex: number;
  };
  embedding?: number[];
}

export class VectorStoreService {
  private documents: ManualDocument[] = [];
  private chunks: DocumentChunk[] = [];
  private readonly chunkSize = 1000;
  private readonly chunkOverlap = 200;

  constructor() {}

  /**
   * 텍스트를 청크로 분할
   */
  private splitText(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;
      
      if ((currentChunk + trimmedSentence).length > this.chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          // Overlap 처리
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.min(words.length, this.chunkOverlap / 10));
          currentChunk = overlapWords.join(' ') + ' ';
        }
      }
      currentChunk += trimmedSentence + '. ';
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 50); // 너무 짧은 청크 제거
  }

  /**
   * OpenAI API로 임베딩 생성
   */
  private async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('임베딩 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 코사인 유사도 계산
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * PDF 문서를 처리하여 벡터 저장소에 추가
   */
  async addPDFDocument(
    filePath: string,
    metadata: {
      title: string;
      disasterType: string;
      category: string;
      source: string;
    }
  ): Promise<void> {
    try {
      console.log(`📄 PDF 처리 시작: ${metadata.title}`);
      
      // PDF 텍스트 추출 (임시 mock 처리를 위해 파일명에서 제목 추출)
      console.log('⚠️ PDF 텍스트 추출 임시 처리 모드');
      const pdfData = {
        text: `재난 안전 가이드: ${metadata.title}

이것은 재난 상황에서의 안전 행동 지침입니다. 지진 발생 시에는 다음과 같은 절차를 따르십시오:

1. 즉시 튼튼한 테이블 아래로 피하여 머리와 몸을 보호하세요.
2. 흔들림이 멈출 때까지 그 자리에서 기다리세요.
3. 흔들림이 멈추면 가스와 전기를 차단하고 안전한 곳으로 대피하세요.
4. 엘리베이터는 절대 사용하지 마세요.
5. 건물 밖으로 나갈 때는 낙하물에 주의하세요.

장애인을 위한 특별 지침:
- 시각장애인: 지팡이를 이용하여 장애물을 확인하며 천천히 이동
- 청각장애인: 시각적 신호와 진동으로 상황 파악
- 거동불편자: 주변 도움을 요청하고 안전한 장소에서 구조 대기

비상연락처와 대피소 위치를 미리 확인해 두세요.`
      };
      
      console.log(`📝 텍스트 추출 완료: ${pdfData.text.length}자`);
      
      // 텍스트를 청크로 분할
      const textChunks = this.splitText(pdfData.text);
      console.log(`🔪 텍스트 분할 완료: ${textChunks.length}개 청크`);
      
      // 각 청크에 대한 임베딩 생성
      console.log('🔄 임베딩 생성 중...');
      const documentChunks: DocumentChunk[] = [];
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`⚡ 임베딩 생성 중 (${i + 1}/${textChunks.length})`);
        
        try {
          const embedding = await this.createEmbedding(chunk);
          
          const documentChunk: DocumentChunk = {
            id: `${metadata.title}_chunk_${i}`,
            content: chunk,
            metadata: {
              title: metadata.title,
              disasterType: metadata.disasterType,
              category: metadata.category,
              source: metadata.source,
              chunkIndex: i,
            },
            embedding: embedding,
          };
          
          documentChunks.push(documentChunk);
          
          // API 사용량 제한을 위한 짧은 지연
          if (i < textChunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`❌ 청크 ${i} 임베딩 실패:`, error);
          // 임베딩 실패한 청크는 건너뛰기
          continue;
        }
      }

      // 청크들을 저장소에 추가
      this.chunks.push(...documentChunks);

      // 메타데이터 저장
      const manualDoc: ManualDocument = {
        id: metadata.title,
        title: metadata.title,
        content: pdfData.text.substring(0, 2000), // 미리보기용
        source: metadata.source,
        disasterType: metadata.disasterType,
        category: metadata.category,
        confidence: 1.0,
      };

      this.documents.push(manualDoc);
      
      console.log(`✅ PDF 처리 완료: ${metadata.title} (${documentChunks.length}/${textChunks.length}개 청크 성공)`);
      
    } catch (error) {
      console.error(`❌ PDF 처리 실패: ${metadata.title}`, error);
      throw error;
    }
  }

  /**
   * 쿼리와 관련된 문서 검색
   */
  async searchRelevantDocuments(
    query: string,
    disasterType?: string,
    k: number = 5
  ): Promise<ManualDocument[]> {
    if (this.chunks.length === 0) {
      console.log('⚠️ 저장된 문서가 없습니다');
      return [];
    }

    try {
      console.log(`🔍 문서 검색 시작: "${query}"`);
      
      // 쿼리 임베딩 생성
      const queryEmbedding = await this.createEmbedding(query);
      
      // 모든 청크와 유사도 계산
      const similarities: Array<{ chunk: DocumentChunk; similarity: number }> = [];
      
      for (const chunk of this.chunks) {
        if (!chunk.embedding) continue;
        
        // 재난 유형 필터링 (선택적)
        if (disasterType && chunk.metadata.disasterType !== disasterType) {
          continue;
        }
        
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        similarities.push({ chunk, similarity });
      }
      
      // 유사도 기준으로 정렬
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      // 중복 제목 제거하고 상위 결과 선택
      const relevantDocs: ManualDocument[] = [];
      const seenTitles = new Set<string>();
      
      for (const { chunk, similarity } of similarities) {
        // 중복 제목 제거 (같은 문서의 다른 청크)
        if (seenTitles.has(chunk.metadata.title)) {
          continue;
        }
        
        seenTitles.add(chunk.metadata.title);
        
        const manualDoc: ManualDocument = {
          id: chunk.id,
          title: chunk.metadata.title,
          content: chunk.content,
          source: chunk.metadata.source,
          disasterType: chunk.metadata.disasterType,
          category: chunk.metadata.category,
          confidence: similarity,
        };
        
        relevantDocs.push(manualDoc);
        
        if (relevantDocs.length >= k) {
          break;
        }
      }

      console.log(`📋 검색 결과: ${relevantDocs.length}개 문서 (신뢰도 ${relevantDocs[0]?.confidence.toFixed(3)} ~ ${relevantDocs[relevantDocs.length - 1]?.confidence.toFixed(3)})`);
      
      return relevantDocs;
      
    } catch (error) {
      console.error('❌ 문서 검색 실패:', error);
      return [];
    }
  }

  /**
   * 벡터 저장소 저장
   */
  async saveVectorStore(directory: string): Promise<void> {
    try {
      // 디렉토리 생성
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // 청크 데이터 저장
      const chunksPath = path.join(directory, 'chunks.json');
      fs.writeFileSync(chunksPath, JSON.stringify(this.chunks, null, 2));
      
      // 메타데이터 저장
      const metadataPath = path.join(directory, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(this.documents, null, 2));
      
      console.log(`💾 벡터 저장소 저장 완료: ${directory}`);
      
    } catch (error) {
      console.error('❌ 벡터 저장소 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 벡터 저장소 로드
   */
  async loadVectorStore(directory: string): Promise<void> {
    try {
      if (fs.existsSync(directory)) {
        // 청크 데이터 로드
        const chunksPath = path.join(directory, 'chunks.json');
        if (fs.existsSync(chunksPath)) {
          const chunksData = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
          this.chunks = chunksData;
        }
        
        // 메타데이터 로드
        const metadataPath = path.join(directory, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          this.documents = metadata;
        }
        
        console.log(`📂 벡터 저장소 로드 완료: ${this.documents.length}개 문서, ${this.chunks.length}개 청크`);
      } else {
        console.log('📂 저장된 벡터 저장소가 없습니다. 새로 생성합니다.');
      }
    } catch (error) {
      console.error('❌ 벡터 저장소 로드 실패:', error);
      // 로드 실패시 새로 시작
      this.chunks = [];
      this.documents = [];
    }
  }

  /**
   * 현재 저장된 문서 목록 조회
   */
  getStoredDocuments(): ManualDocument[] {
    return [...this.documents];
  }

  /**
   * 저장소 상태 확인
   */
  isInitialized(): boolean {
    return this.chunks.length > 0;
  }

  /**
   * 저장소 초기화
   */
  async initialize(): Promise<void> {
    const vectorStoreDir = path.join(process.cwd(), 'data', 'vector_store');
    
    // 디렉토리 생성
    if (!fs.existsSync(path.dirname(vectorStoreDir))) {
      fs.mkdirSync(path.dirname(vectorStoreDir), { recursive: true });
    }

    await this.loadVectorStore(vectorStoreDir);
  }
}

// 글로벌 인스턴스
export const vectorStoreService = new VectorStoreService();