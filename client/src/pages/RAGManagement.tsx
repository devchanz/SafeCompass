import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Search, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadResult {
  filename: string;
  title: string;
  disasterType: string;
  category: string;
  source: string;
  status: 'success' | 'error';
  error?: string;
}

interface KnowledgeBaseStats {
  totalManuals: number;
  sources: string[];
  isInitialized: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  disasterType: string;
  category: string;
  confidence: number;
}

export default function RAGManagement() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 지식베이스 상태 조회
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pdf/status');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('지식베이스 상태 조회 실패:', error);
    }
  };

  // 컴포넌트 로드시 상태 조회
  useState(() => {
    fetchStats();
  });

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
    setUploadResults([]);
  };

  // PDF 파일 업로드
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "파일을 선택해주세요",
        description: "업로드할 PDF 파일을 먼저 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(selectedFiles).forEach(file => {
      formData.append('pdfs', file);
    });

    try {
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result.results);
        setStats(result.knowledgeBaseStats);
        
        toast({
          title: "업로드 완료",
          description: `${result.successCount}개 파일 처리 완료 (${result.errorCount}개 실패)`,
        });
        
        // 파일 선택 초기화
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 지식베이스 검색
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "검색어를 입력해주세요",
        description: "검색할 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('/api/pdf/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          disasterType: 'earthquake'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSearchResults(result.results);
        toast({
          title: "검색 완료",
          description: `${result.resultCount}개 결과를 찾았습니다.`,
        });
      } else {
        throw new Error(result.error || 'Search failed');
      }
    } catch (error) {
      toast({
        title: "검색 실패",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          RAG 지식베이스 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          재난 대응 매뉴얼 PDF 파일을 업로드하여 개인화된 가이드의 신뢰성을 높입니다
        </p>
      </div>

      {/* 지식베이스 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            지식베이스 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalManuals}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">등록된 매뉴얼</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.sources.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">참조 출처</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isInitialized ? '활성화' : '비활성화'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">시스템 상태</div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>지식베이스 상태를 확인하는 중...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF 업로드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            PDF 매뉴얼 업로드
          </CardTitle>
          <CardDescription>
            정부 발행 재난 대응 매뉴얼 PDF 파일을 여러 개 선택하여 업로드하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-files">PDF 파일 선택</Label>
            <Input
              ref={fileInputRef}
              id="pdf-files"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>선택된 파일 ({selectedFiles.length}개)</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                업로드 처리 중...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                PDF 파일 업로드 및 처리
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 업로드 결과 */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>업로드 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.filename}</div>
                    {result.status === 'success' ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        제목: {result.title} | 유형: {result.disasterType} | 출처: {result.source}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        오류: {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 지식베이스 검색 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            지식베이스 검색 테스트
          </CardTitle>
          <CardDescription>
            업로드된 매뉴얼에서 관련 내용을 검색해볼 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="검색할 재난 상황이나 키워드를 입력하세요 (예: 지진 발생시 실내 행동요령)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <Label>검색 결과 ({searchResults.length}개)</Label>
              {searchResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{result.title}</h4>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      신뢰도: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    출처: {result.source} | 유형: {result.disasterType} | 카테고리: {result.category}
                  </div>
                  <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {result.content.substring(0, 300)}
                    {result.content.length > 300 && '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}