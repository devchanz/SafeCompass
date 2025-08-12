import * as path from 'path';
import * as fs from 'fs';
import { ragService } from './services/ragService.js'; // Adjust path if necessary

const pdfFiles = [
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\국민재난안전포탈_지진.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\2.시각장애인+지진+재난대응+안내서.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\8.그+밖의+장애인+지진+재난대응+안내서.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\1. 이동이 어려운 장애인을 위한 재난 안전 가이드.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\2. 계단 이동이 어려운 장애인을 위한 재난 안전 가이드.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\3. 시각 정보 습득이 어려운 장애인을 위한 재난 안전 가이드.pdf",
  "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\4. 의미 이해가 어려운 장애인을 위한 재난 안전 가이드.pdf"
];

async function processPdfs() {
  console.log("Starting PDF processing for RAG...");

  for (const filePath of pdfFiles) {
    try {
      const originalName = path.basename(filePath);
      console.log(`📄 Processing: ${originalName}`);

      const metadata = {
        title: path.basename(originalName, '.pdf'),
        disasterType: 'earthquake', // Default
        category: 'government', // Default
        source: '정부 공식 매뉴얼' // Default
      };

      // Infer disaster type
      if (originalName.includes('화재') || originalName.includes('fire')) {
        metadata.disasterType = 'fire';
      } else if (originalName.includes('홍수') || originalName.includes('flood')) {
        metadata.disasterType = 'flood';
      } else if (originalName.includes('태풍') || originalName.includes('typhoon')) {
        metadata.disasterType = 'typhoon';
      } else if (originalName.includes('지진') || originalName.includes('earthquake')) {
        metadata.disasterType = 'earthquake';
      }

      // Infer category and source
      if (originalName.includes('장애') || originalName.includes('accessibility')) {
        metadata.category = 'accessibility';
        metadata.source = '접근성 특화 안전 매뉴얼';
      } else if (originalName.includes('고령') || originalName.includes('elderly')) {
        metadata.category = 'elderly';
        metadata.source = '고령자 안전 매뉴얼';
      }

      await ragService.addPDFManual(filePath, metadata);
      console.log(`✅ Successfully processed: ${originalName}`);

    } catch (error) {
      console.error(`❌ Failed to process ${filePath}:`, error);
    }
  }

  try {
    await ragService.saveKnowledgeBase();
    console.log("💾 Knowledge base saved successfully.");
  } catch (error) {
    console.error("❌ Failed to save knowledge base:", error);
  }

  console.log("PDF processing complete.");
}

processPdfs();
