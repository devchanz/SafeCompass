"use strict";
/**
 * 벡터 저장소 서비스
 * PDF 문서를 임베딩하여 RAG 검색을 위한 벡터 데이터베이스 구축
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStoreService = exports.VectorStoreService = void 0;
var fs = require("fs");
var path = require("path");
var node_fetch_1 = require("node-fetch");
var pdf_parse_1 = require("pdf-parse");
var VectorStoreService = /** @class */ (function () {
    function VectorStoreService() {
        this.documents = [];
        this.chunks = [];
        this.chunkSize = 1000;
        this.chunkOverlap = 200;
    }
    /**
     * 텍스트를 청크로 분할
     */
    VectorStoreService.prototype.splitText = function (text) {
        var chunks = [];
        var sentences = text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; });
        var currentChunk = '';
        for (var _i = 0, sentences_1 = sentences; _i < sentences_1.length; _i++) {
            var sentence = sentences_1[_i];
            var trimmedSentence = sentence.trim();
            if (trimmedSentence.length === 0)
                continue;
            if ((currentChunk + trimmedSentence).length > this.chunkSize) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    // Overlap 처리
                    var words = currentChunk.split(' ');
                    var overlapWords = words.slice(-Math.min(words.length, this.chunkOverlap / 10));
                    currentChunk = overlapWords.join(' ') + ' ';
                }
            }
            currentChunk += trimmedSentence + '. ';
        }
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }
        return chunks.filter(function (chunk) { return chunk.length > 50; }); // 너무 짧은 청크 제거
    };
    /**
     * OpenAI API로 임베딩 생성
     */
    VectorStoreService.prototype.createEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, node_fetch_1.default)('https://api.openai.com/v1/embeddings', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(process.env.OPENAI_API_KEY),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    model: 'text-embedding-3-small',
                                    input: text,
                                    encoding_format: 'float',
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("OpenAI API \uC624\uB958: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data.data[0].embedding];
                    case 3:
                        error_1 = _a.sent();
                        console.error('임베딩 생성 실패:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 코사인 유사도 계산
     */
    VectorStoreService.prototype.cosineSimilarity = function (a, b) {
        if (a.length !== b.length)
            return 0;
        var dotProduct = 0;
        var normA = 0;
        var normB = 0;
        for (var i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    /**
     * PDF 문서를 처리하여 벡터 저장소에 추가
     */
    VectorStoreService.prototype.addPDFDocument = function (filePath, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var dataBuffer, pdfData, extractedText, textChunks, documentChunks, i, chunk, embedding, documentChunk, error_2, manualDoc, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        console.log("\uD83D\uDCC4 PDF \uCC98\uB9AC \uC2DC\uC791: ".concat(metadata.title));
                        // 1. PDF 파일 읽기
                        if (!fs.existsSync(filePath)) {
                            throw new Error("\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ".concat(filePath));
                        }
                        dataBuffer = fs.readFileSync(filePath);
                        return [4 /*yield*/, (0, pdf_parse_1.default)(dataBuffer)];
                    case 1:
                        pdfData = _b.sent();
                        extractedText = pdfData.text;
                        if (!extractedText || extractedText.trim().length === 0) {
                            console.log("\u26A0\uFE0F PDF\uC5D0\uC11C \uD14D\uC2A4\uD2B8\uB97C \uCD94\uCD9C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: ".concat(metadata.title, ". \uC774\uBBF8\uC9C0\uB9CC \uD3EC\uD568\uB41C \uD30C\uC77C\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4."));
                            return [2 /*return*/]; // 텍스트가 없으면 처리 중단
                        }
                        console.log("\uD83D\uDCDD \uD14D\uC2A4\uD2B8 \uCD94\uCD9C \uC644\uB8CC: ".concat(extractedText.length, "\uC790"));
                        textChunks = this.splitText(extractedText);
                        console.log("\uD83D\uDD2A \uD14D\uC2A4\uD2B8 \uBD84\uD560 \uC644\uB8CC: ".concat(textChunks.length, "\uAC1C \uCCAD\uD06C"));
                        // 4. 각 청크에 대한 임베딩 생성
                        console.log('🔄 임베딩 생성 중...');
                        documentChunks = [];
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < textChunks.length)) return [3 /*break*/, 9];
                        chunk = textChunks[i];
                        console.log("\u26A1 \uC784\uBCA0\uB529 \uC0DD\uC131 \uC911 (".concat(i + 1, "/").concat(textChunks.length, ")"));
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, this.createEmbedding(chunk)];
                    case 4:
                        embedding = _b.sent();
                        documentChunk = {
                            id: "".concat(metadata.title, "_chunk_").concat(i),
                            content: chunk,
                            metadata: __assign(__assign({}, metadata), { chunkIndex: i }),
                            embedding: embedding,
                        };
                        documentChunks.push(documentChunk);
                        if (!(i < textChunks.length - 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        console.error("\u274C \uCCAD\uD06C ".concat(i, " \uC784\uBCA0\uB529 \uC2E4\uD328:"), error_2);
                        return [3 /*break*/, 8]; // 임베딩 실패한 청크는 건너뛰기
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9:
                        // 5. 청크들을 저장소에 추가
                        (_a = this.chunks).push.apply(_a, documentChunks);
                        manualDoc = __assign({ id: metadata.title, content: extractedText.substring(0, 2000), confidence: 1.0 }, metadata);
                        this.documents.push(manualDoc);
                        console.log("\u2705 PDF \uCC98\uB9AC \uC644\uB8CC: ".concat(metadata.title, " (").concat(documentChunks.length, "/").concat(textChunks.length, "\uAC1C \uCCAD\uD06C \uC131\uACF5)"));
                        return [3 /*break*/, 11];
                    case 10:
                        error_3 = _b.sent();
                        console.error("\u274C PDF \uCC98\uB9AC \uC2E4\uD328: ".concat(metadata.title), error_3);
                        throw error_3;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 쿼리와 관련된 문서 검색
     */
    VectorStoreService.prototype.searchRelevantDocuments = function (query_1, disasterType_1) {
        return __awaiter(this, arguments, void 0, function (query, disasterType, k) {
            var queryEmbedding, similarities, _i, _a, chunk, similarity, relevantDocs, seenTitles, _b, similarities_1, _c, chunk, similarity, manualDoc, error_4;
            var _d, _e;
            if (k === void 0) { k = 5; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (this.chunks.length === 0) {
                            console.log('⚠️ 저장된 문서가 없습니다');
                            return [2 /*return*/, []];
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 3, , 4]);
                        console.log("\uD83D\uDD0D \uBB38\uC11C \uAC80\uC0C9 \uC2DC\uC791: \"".concat(query, "\""));
                        return [4 /*yield*/, this.createEmbedding(query)];
                    case 2:
                        queryEmbedding = _f.sent();
                        similarities = [];
                        for (_i = 0, _a = this.chunks; _i < _a.length; _i++) {
                            chunk = _a[_i];
                            if (!chunk.embedding)
                                continue;
                            // 재난 유형 필터링 (선택적)
                            if (disasterType && chunk.metadata.disasterType !== disasterType) {
                                continue;
                            }
                            similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
                            similarities.push({ chunk: chunk, similarity: similarity });
                        }
                        // 유사도 기준으로 정렬
                        similarities.sort(function (a, b) { return b.similarity - a.similarity; });
                        relevantDocs = [];
                        seenTitles = new Set();
                        for (_b = 0, similarities_1 = similarities; _b < similarities_1.length; _b++) {
                            _c = similarities_1[_b], chunk = _c.chunk, similarity = _c.similarity;
                            // 중복 제목 제거 (같은 문서의 다른 청크)
                            if (seenTitles.has(chunk.metadata.title)) {
                                continue;
                            }
                            seenTitles.add(chunk.metadata.title);
                            manualDoc = {
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
                        console.log("\uD83D\uDCCB \uAC80\uC0C9 \uACB0\uACFC: ".concat(relevantDocs.length, "\uAC1C \uBB38\uC11C (\uC2E0\uB8B0\uB3C4 ").concat((_d = relevantDocs[0]) === null || _d === void 0 ? void 0 : _d.confidence.toFixed(3), " ~ ").concat((_e = relevantDocs[relevantDocs.length - 1]) === null || _e === void 0 ? void 0 : _e.confidence.toFixed(3), ")"));
                        return [2 /*return*/, relevantDocs];
                    case 3:
                        error_4 = _f.sent();
                        console.error('❌ 문서 검색 실패:', error_4);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 벡터 저장소 저장
     */
    VectorStoreService.prototype.saveVectorStore = function (directory) {
        return __awaiter(this, void 0, void 0, function () {
            var chunksPath, metadataPath;
            return __generator(this, function (_a) {
                try {
                    // 디렉토리 생성
                    if (!fs.existsSync(directory)) {
                        fs.mkdirSync(directory, { recursive: true });
                    }
                    chunksPath = path.join(directory, 'chunks.json');
                    fs.writeFileSync(chunksPath, JSON.stringify(this.chunks, null, 2));
                    metadataPath = path.join(directory, 'metadata.json');
                    fs.writeFileSync(metadataPath, JSON.stringify(this.documents, null, 2));
                    console.log("\uD83D\uDCBE \uBCA1\uD130 \uC800\uC7A5\uC18C \uC800\uC7A5 \uC644\uB8CC: ".concat(directory));
                }
                catch (error) {
                    console.error('❌ 벡터 저장소 저장 실패:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 벡터 저장소 로드
     */
    VectorStoreService.prototype.loadVectorStore = function (directory) {
        return __awaiter(this, void 0, void 0, function () {
            var chunksPath, chunksData, metadataPath, metadata;
            return __generator(this, function (_a) {
                try {
                    if (fs.existsSync(directory)) {
                        chunksPath = path.join(directory, 'chunks.json');
                        if (fs.existsSync(chunksPath)) {
                            chunksData = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));
                            this.chunks = chunksData;
                        }
                        metadataPath = path.join(directory, 'metadata.json');
                        if (fs.existsSync(metadataPath)) {
                            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
                            this.documents = metadata;
                        }
                        console.log("\uD83D\uDCC2 \uBCA1\uD130 \uC800\uC7A5\uC18C \uB85C\uB4DC \uC644\uB8CC: ".concat(this.documents.length, "\uAC1C \uBB38\uC11C, ").concat(this.chunks.length, "\uAC1C \uCCAD\uD06C"));
                    }
                    else {
                        console.log('📂 저장된 벡터 저장소가 없습니다. 새로 생성합니다.');
                    }
                }
                catch (error) {
                    console.error('❌ 벡터 저장소 로드 실패:', error);
                    // 로드 실패시 새로 시작
                    this.chunks = [];
                    this.documents = [];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 현재 저장된 문서 목록 조회
     */
    VectorStoreService.prototype.getStoredDocuments = function () {
        return __spreadArray([], this.documents, true);
    };
    /**
     * 저장소 상태 확인
     */
    VectorStoreService.prototype.isInitialized = function () {
        return this.chunks.length > 0;
    };
    /**
     * 저장소 초기화
     */
    VectorStoreService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vectorStoreDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vectorStoreDir = path.join(process.cwd(), 'data', 'vector_store');
                        // 디렉토리 생성
                        if (!fs.existsSync(path.dirname(vectorStoreDir))) {
                            fs.mkdirSync(path.dirname(vectorStoreDir), { recursive: true });
                        }
                        return [4 /*yield*/, this.loadVectorStore(vectorStoreDir)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return VectorStoreService;
}());
exports.VectorStoreService = VectorStoreService;
// 글로벌 인스턴스
exports.vectorStoreService = new VectorStoreService();
