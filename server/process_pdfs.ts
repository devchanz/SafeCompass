import * as path from 'path';
import * as fs from 'fs';
import { ragService } from './services/ragService.js'; // Adjust path if necessary

async function processPdfs(directoryPath: string) {
  console.log("Starting PDF processing for RAG...");

  const files = fs.readdirSync(directoryPath);
  const pdfFiles = files.filter(file => file.endsWith('.pdf')).map(file => path.join(directoryPath, file));

  if (pdfFiles.length === 0) {
    console.log(`No PDF files found in the directory: ${directoryPath}`);
    return;
  }

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

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: npx tsx server/process_pdfs.ts <path_to_pdf_directory>");
  process.exit(1);
}

const pdfDirectory = args[0];
processPdfs(pdfDirectory);
