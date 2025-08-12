"use strict";
/**
 * RAG (Retrieval-Augmented Generation) 서비스
 * 개인화된 재난 대응 가이드 생성을 위한 지식 검색 및 컨텍스트 생성
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
exports.ragService = exports.RagService = void 0;
var vectorStore_js_1 = require("./vectorStore.js");
var openai_js_1 = require("./openai.js");
var RagService = /** @class */ (function () {
    function RagService() {
        this.initialize();
    }
    /**
     * RAG 서비스 초기화
     */
    RagService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vectorStore_js_1.vectorStoreService.initialize()];
                    case 1:
                        _a.sent();
                        console.log('✅ RAG 서비스 초기화 완료');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ RAG 서비스 초기화 실패:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 사용자 상황과 재난 유형에 따른 관련 매뉴얼 검색
     */
    RagService.prototype.searchRelevantManuals = function (disasterType, userContext) {
        return __awaiter(this, void 0, void 0, function () {
            var searchQueries, allResults, _i, searchQueries_1, query, results, uniqueResults_1, relevantManuals, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        console.log("\uD83D\uDD0D RAG \uAC80\uC0C9: ".concat(disasterType, ", ").concat(userContext.location, ", ").concat(userContext.mobility, ", ").concat(userContext.accessibility.join(',')));
                        searchQueries = __spreadArray([
                            "".concat(disasterType, " ").concat(userContext.location, " \uB300\uD53C \uD589\uB3D9\uC694\uB839"),
                            "".concat(disasterType, " ").concat(userContext.mobility === 'independent' ? '일반인' : userContext.mobility === 'assisted' ? '거동불편' : '휠체어', " \uB300\uC751")
                        ], userContext.accessibility.map(function (access) { return "".concat(disasterType, " ").concat(access === 'hearing' ? '청각장애' : access === 'visual' ? '시각장애' : access, " \uB300\uC751"); }), true);
                        allResults = [];
                        _i = 0, searchQueries_1 = searchQueries;
                        _b.label = 1;
                    case 1:
                        if (!(_i < searchQueries_1.length)) return [3 /*break*/, 4];
                        query = searchQueries_1[_i];
                        return [4 /*yield*/, vectorStore_js_1.vectorStoreService.searchRelevantDocuments(query, disasterType, 2)];
                    case 2:
                        results = _b.sent();
                        allResults.push.apply(allResults, results);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        uniqueResults_1 = new Map();
                        allResults.forEach(function (doc) {
                            var existing = uniqueResults_1.get(doc.id);
                            if (!existing || existing.confidence < doc.confidence) {
                                uniqueResults_1.set(doc.id, doc);
                            }
                        });
                        relevantManuals = Array.from(uniqueResults_1.values())
                            .sort(function (a, b) { return b.confidence - a.confidence; })
                            .slice(0, 5);
                        console.log("\uD83D\uDCDA \uCD1D ".concat(relevantManuals.length, "\uAC1C \uC2E0\uB8B0\uC131 \uB192\uC740 \uB9E4\uB274\uC5BC \uAC80\uC0C9\uB428"));
                        // 신뢰도가 너무 낮은 경우 기본 매뉴얼 반환
                        if (relevantManuals.length === 0 || ((_a = relevantManuals[0]) === null || _a === void 0 ? void 0 : _a.confidence) < 0.3) {
                            console.log('⚠️ 관련 매뉴얼을 찾지 못했습니다. 기본 가이드를 사용합니다.');
                            return [2 /*return*/, this.getDefaultManuals(disasterType)];
                        }
                        return [2 /*return*/, relevantManuals];
                    case 5:
                        error_2 = _b.sent();
                        console.error('❌ RAG 검색 실패:', error_2);
                        return [2 /*return*/, this.getDefaultManuals(disasterType)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 기본 매뉴얼 반환 (벡터 검색 실패시 대체)
     */
    RagService.prototype.getDefaultManuals = function (disasterType) {
        var defaultManuals = {
            earthquake: {
                id: 'earthquake_default',
                title: '지진 발생시 기본 행동요령',
                content: "\uC9C0\uC9C4 \uBC1C\uC0DD\uC2DC \uAE30\uBCF8 \uD589\uB3D9\uC694\uB839:\n1. \uC2E4\uB0B4\uC5D0\uC11C\uB294 \uD2BC\uD2BC\uD55C \uCC45\uC0C1 \uBC11\uC73C\uB85C \uBAB8\uC744 \uD53C\uD558\uACE0 \uBAB8\uC744 \uBCF4\uD638\uD558\uC138\uC694\n2. \uBB38\uC774\uB098 \uBE44\uC0C1\uAD6C\uB97C \uD655\uBCF4\uD558\uACE0 \uAC00\uC2A4\uC640 \uC804\uAE30\uB97C \uCC28\uB2E8\uD558\uC138\uC694\n3. \uC5D8\uB9AC\uBCA0\uC774\uD130 \uC0AC\uC6A9\uD558\uC9C0 \uB9D0\uACE0 \uACC4\uB2E8\uC73C\uB85C \uB300\uD53C\uD558\uC138\uC694\n4. \uC2E4\uC678\uC5D0\uC11C\uB294 \uAC74\uBB3C\uACFC \uC804\uC120, \uAC00\uB85C\uB4F1\uC5D0\uC11C \uB5A8\uC5B4\uC9C4 \uC548\uC804\uD55C \uACF3\uC73C\uB85C \uB300\uD53C\n5. \uC790\uB3D9\uCC28 \uC6B4\uC804\uC911\uC774\uBA74 \uC11C\uC11C\uD788 \uC18D\uB3C4\uB97C \uC904\uC5EC \uB3C4\uB85C \uC624\uB978\uCABD\uC5D0 \uC815\uCC28",
                source: '행정안전부 재난안전 기본 매뉴얼',
                disasterType: 'earthquake',
                category: 'basic',
                confidence: 0.8
            },
            fire: {
                id: 'fire_default',
                title: '화재 발생시 기본 행동요령',
                content: "\uD654\uC7AC \uBC1C\uC0DD\uC2DC \uD589\uB3D9\uC694\uB839:\n1. \"\uBD88\uC774\uC57C\"\uB77C\uACE0 \uD06C\uAC8C \uC678\uCE58\uACE0 \uD654\uC7AC\uACBD\uBCF4\uAE30\uB97C \uB204\uB974\uC138\uC694\n2. 119\uC5D0 \uC989\uC2DC \uC2E0\uACE0\uD558\uC138\uC694\n3. \uC5F0\uAE30\uAC00 \uC788\uB294 \uACF3\uC5D0\uC11C\uB294 \uC790\uC138\uB97C \uB0AE\uCDB0 \uB300\uD53C\uD558\uC138\uC694\n4. \uC816\uC740 \uC218\uAC74\uC73C\uB85C \uCF54\uC640 \uC785\uC744 \uB9C9\uACE0 \uBCBD\uC744 \uB530\uB77C \uC774\uB3D9\uD558\uC138\uC694\n5. \uC5D8\uB9AC\uBCA0\uC774\uD130 \uC808\uB300 \uC0AC\uC6A9 \uAE08\uC9C0, \uACC4\uB2E8\uC73C\uB85C\uB9CC \uB300\uD53C\uD558\uC138\uC694",
                source: '소방청 화재안전 기본 매뉴얼',
                disasterType: 'fire',
                category: 'basic',
                confidence: 0.8
            }
        };
        return defaultManuals[disasterType] ? [defaultManuals[disasterType]] : [];
    };
    /**
     * 검색된 매뉴얼들을 바탕으로 컨텍스트 생성
     */
    RagService.prototype.generateContext = function (manuals, userContext) {
        if (manuals.length === 0) {
            return "기본적인 안전 수칙을 따라 침착하게 행동하세요.";
        }
        var context = "다음 공식 안전 매뉴얼을 참조하여 답변하세요:\n\n";
        manuals.forEach(function (manual, index) {
            context += "[\uB9E4\uB274\uC5BC ".concat(index + 1, "] ").concat(manual.title, "\n");
            context += "\uCD9C\uCC98: ".concat(manual.source, "\n");
            context += "\uC2E0\uB8B0\uB3C4: ".concat((manual.confidence * 100).toFixed(1), "%\n");
            context += "\uB0B4\uC6A9: ".concat(manual.content, "\n\n");
        });
        context += "\uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uACE0\uB824\uD558\uC5EC \uC704 \uB9E4\uB274\uC5BC \uB0B4\uC6A9\uC744 \uBC14\uD0D5\uC73C\uB85C \uAD6C\uCCB4\uC801\uC774\uACE0 \uC2E4\uD589 \uAC00\uB2A5\uD55C \uAC00\uC774\uB4DC\uB97C \uC81C\uACF5\uD558\uC138\uC694.";
        return context;
    };
    /**
     * PDF 매뉴얼 추가
     */
    RagService.prototype.addPDFManual = function (filePath, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vectorStore_js_1.vectorStoreService.addPDFDocument(filePath, metadata)];
                    case 1:
                        _a.sent();
                        console.log("\u2705 PDF \uB9E4\uB274\uC5BC \uCD94\uAC00 \uC644\uB8CC: ".concat(metadata.title));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("\u274C PDF \uB9E4\uB274\uC5BC \uCD94\uAC00 \uC2E4\uD328: ".concat(metadata.title), error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 벡터 저장소 저장
     */
    RagService.prototype.saveKnowledgeBase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path, vectorStoreDir, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('path'); })];
                    case 1:
                        path = _a.sent();
                        vectorStoreDir = path.join(process.cwd(), 'data', 'vector_store');
                        return [4 /*yield*/, vectorStore_js_1.vectorStoreService.saveVectorStore(vectorStoreDir)];
                    case 2:
                        _a.sent();
                        console.log('💾 지식베이스 저장 완료');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('❌ 지식베이스 저장 실패:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 개인화된 가이드 생성 (RAG 통합)
     */
    RagService.prototype.generatePersonalizedGuide = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantManuals, context, enhancedRequest, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.searchRelevantManuals('earthquake', // 현재는 지진으로 고정
                            {
                                age: request.userProfile.age,
                                mobility: request.userProfile.mobility,
                                location: request.situation.locationContext,
                                accessibility: request.userProfile.accessibility
                            })];
                    case 1:
                        relevantManuals = _a.sent();
                        context = this.generateContext(relevantManuals, request.userProfile);
                        enhancedRequest = __assign(__assign({}, request), { relevantManuals: [context] });
                        return [4 /*yield*/, (0, openai_js_1.generatePersonalizedGuide)(enhancedRequest)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_5 = _a.sent();
                        console.error('❌ RAG 기반 가이드 생성 실패:', error_5);
                        return [2 /*return*/, {
                                guide: {
                                    title: "긴급 지진 대응 가이드",
                                    primaryActions: [
                                        "머리와 목을 보호하세요",
                                        "튼튼한 테이블 아래로 피하세요",
                                        "흔들림이 멈출 때까지 기다리세요",
                                        "안전한 경로로 대피하세요"
                                    ],
                                    detailedInstructions: this.generateBasicEmergencyGuide(request),
                                    emergencyContacts: ["119", "112", "1588-3650"]
                                },
                                audioText: "지진이 발생했습니다. 즉시 안전한 곳으로 피하세요.",
                                estimatedReadingTime: 2
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 기본 비상 가이드 생성 (RAG 실패시 대체)
     */
    RagService.prototype.generateBasicEmergencyGuide = function (request) {
        var language = request.userProfile.language === 'english' ? 'english' : 'korean';
        if (language === 'korean') {
            return "# \uAE34\uAE09 \uC9C0\uC9C4 \uB300\uC751 \uAC00\uC774\uB4DC\n      \n\uD604\uC7AC \uC0C1\uD669: ".concat(request.situation.locationContext, "\n\uB300\uD53C \uB2A5\uB825: ").concat(request.userProfile.mobility === 'independent' ? '자력대피 가능' :
                request.userProfile.mobility === 'assisted' ? '부분 도움 필요' : '자력대피 불가능', "\n\n## \uC989\uC2DC \uD589\uB3D9\uC0AC\uD56D\n1. \uBA38\uB9AC\uC640 \uBAA9 \uBCF4\uD638\uD558\uAE30 - \uCC45\uC0C1\uC774\uB098 \uD2BC\uD2BC\uD55C \uAC00\uAD6C \uC544\uB798\uB85C \uD53C\uD558\uC138\uC694\n2. \uD754\uB4E4\uB9BC\uC774 \uBA48\uCD9C \uB54C\uAE4C\uC9C0 \uAE30\uB2E4\uB9AC\uAE30\n3. \uC548\uC804\uD55C \uACBD\uB85C\uB85C \uB300\uD53C\uD558\uAE30 (\uACC4\uB2E8 \uC774\uC6A9, \uC5D8\uB9AC\uBCA0\uC774\uD130 \uAE08\uC9C0)\n\n## \uAE34\uAE09\uC5F0\uB77D\uCC98\n- 119: \uC18C\uBC29\uC11C (\uD654\uC7AC, \uAD6C\uC870)\n- 112: \uACBD\uCC30\uC11C (\uC2E0\uACE0, \uB3C4\uC6C0)\n- 1588-3650: \uC7AC\uB09C\uC2E0\uACE0\uC13C\uD130");
        }
        else {
            return "# Emergency Earthquake Response Guide\n      \nCurrent Situation: ".concat(request.situation.locationContext, "\nEvacuation Ability: ").concat(request.userProfile.mobility === 'independent' ? 'Can self-evacuate' :
                request.userProfile.mobility === 'assisted' ? 'Needs partial assistance' : 'Cannot self-evacuate', "\n\n## Immediate Actions\n1. Protect head and neck - Take cover under a desk or sturdy furniture\n2. Wait until shaking stops\n3. Evacuate via safe route (use stairs, no elevators)\n\n## Emergency Contacts\n- 119: Fire Department\n- 112: Police\n- 1588-3650: Disaster Report Center");
        }
    };
    /**
     * 현재 지식 베이스 상태 조회
     */
    RagService.prototype.getKnowledgeBaseStats = function () {
        var documents = vectorStore_js_1.vectorStoreService.getStoredDocuments();
        var sources = Array.from(new Set(documents.map(function (d) { return d.source; })));
        return {
            totalManuals: documents.length,
            sources: sources,
            isInitialized: vectorStore_js_1.vectorStoreService.isInitialized()
        };
    };
    return RagService;
}());
exports.RagService = RagService;
exports.ragService = new RagService();
