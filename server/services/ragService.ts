import { generatePersonalizedGuide, type PersonalizedGuideRequest } from './openai.js';
import manuals from '../data/manuals.json' assert { type: 'json' };

interface DisasterManual {
  id: string;
  type: string;
  situation: string;
  content: string;
  keywords: string[];
}

export class RAGService {
  private manuals: DisasterManual[] = manuals;

  // Simple keyword-based retrieval (in production, this would use vector embeddings)
  private retrieveRelevantManuals(
    disasterType: string,
    locationContext: string,
    mobility: string,
    accessibility: string[]
  ): string[] {
    const searchTerms = [
      disasterType,
      locationContext,
      mobility,
      ...accessibility
    ].map(term => term.toLowerCase());

    const relevantManuals = this.manuals
      .filter(manual => {
        const manualText = (manual.content + ' ' + manual.keywords.join(' ')).toLowerCase();
        return searchTerms.some(term => manualText.includes(term));
      })
      .sort((a, b) => {
        // Score based on keyword matches
        const scoreA = searchTerms.reduce((score, term) => {
          const content = (a.content + ' ' + a.keywords.join(' ')).toLowerCase();
          return score + (content.includes(term) ? 1 : 0);
        }, 0);
        const scoreB = searchTerms.reduce((score, term) => {
          const content = (b.content + ' ' + b.keywords.join(' ')).toLowerCase();
          return score + (content.includes(term) ? 1 : 0);
        }, 0);
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(manual => manual.content);

    return relevantManuals;
  }

  async generatePersonalizedGuide(request: PersonalizedGuideRequest) {
    // Retrieve relevant manuals based on context
    const relevantManuals = this.retrieveRelevantManuals(
      request.situation.disasterType,
      request.situation.locationContext,
      request.userProfile.mobility,
      request.userProfile.accessibility
    );

    // Add retrieved manuals to the request
    const enhancedRequest = {
      ...request,
      relevantManuals
    };

    // Generate personalized guide using OpenAI
    return await generatePersonalizedGuide(enhancedRequest);
  }
}

export const ragService = new RAGService();
