/**
 * PDF 업로드 및 RAG 처리를 위한 라우터
 */

import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ragService } from '../services/ragService.js';

const router = express.Router();

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'data', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 한글 파일명 처리를 위해 원본 이름 유지
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // PDF 파일만 허용
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한
  }
});

/**
 * PDF 파일 업로드 및 RAG 처리
 */
router.post('/upload', upload.array('pdfs', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'PDF 파일을 선택해주세요.' });
    }

    console.log(`📤 ${files.length}개 PDF 파일 업로드됨`);

    const results = [];

    // 각 파일을 처리
    for (const file of files) {
      try {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        
        console.log(`📄 처리 시작: ${originalName}`);

        // 파일명에서 메타데이터 추측
        const metadata = {
          title: path.basename(originalName, '.pdf'),
          disasterType: 'earthquake', // 기본값으로 지진 설정
          category: 'government',
          source: '정부 공식 매뉴얼'
        };

        // 파일명 분석으로 재난 유형 자동 분류
        if (originalName.includes('화재') || originalName.includes('fire')) {
          metadata.disasterType = 'fire';
        } else if (originalName.includes('홍수') || originalName.includes('flood')) {
          metadata.disasterType = 'flood';
        } else if (originalName.includes('태풍') || originalName.includes('typhoon')) {
          metadata.disasterType = 'typhoon';
        }

        // 카테고리 분석
        if (originalName.includes('장애') || originalName.includes('accessibility')) {
          metadata.category = 'accessibility';
          metadata.source = '접근성 특화 안전 매뉴얼';
        } else if (originalName.includes('고령') || originalName.includes('elderly')) {
          metadata.category = 'elderly';
          metadata.source = '고령자 안전 매뉴얼';
        }

        // RAG 시스템에 PDF 추가
        await ragService.addPDFManual(file.path, metadata);

        results.push({
          filename: originalName,
          title: metadata.title,
          disasterType: metadata.disasterType,
          category: metadata.category,
          source: metadata.source,
          status: 'success'
        });

        console.log(`✅ 처리 완료: ${originalName}`);

      } catch (error) {
        console.error(`❌ 파일 처리 실패: ${file.originalname}`, error);
        results.push({
          filename: file.originalname,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 지식베이스 저장
    await ragService.saveKnowledgeBase();

    // 현재 지식베이스 상태 조회
    const stats = ragService.getKnowledgeBaseStats();

    res.json({
      message: `${files.length}개 PDF 파일 처리 완료`,
      results: results,
      knowledgeBaseStats: stats,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: results.filter(r => r.status === 'error').length
    });

  } catch (error) {
    console.error('❌ PDF 업로드 처리 실패:', error);
    res.status(500).json({
      error: 'PDF 파일 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 현재 지식베이스 상태 조회
 */
router.get('/status', (req, res) => {
  try {
    const stats = ragService.getKnowledgeBaseStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ 지식베이스 상태 조회 실패:', error);
    res.status(500).json({
      error: '지식베이스 상태를 조회할 수 없습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 지식베이스 검색 테스트
 */
router.post('/search', async (req, res) => {
  try {
    const { query, disasterType = 'earthquake' } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: '검색 쿼리를 입력해주세요.' });
    }

    const results = await ragService.searchRelevantManuals(disasterType, {
      age: 30,
      mobility: 'independent',
      location: query,
      accessibility: []
    });

    res.json({
      query: query,
      disasterType: disasterType,
      resultCount: results.length,
      results: results
    });

  } catch (error) {
    console.error('❌ 지식베이스 검색 실패:', error);
    res.status(500).json({
      error: '검색 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;