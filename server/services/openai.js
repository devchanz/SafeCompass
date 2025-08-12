"use strict";
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
exports.extractKSLKeywords = extractKSLKeywords;
exports.generatePersonalizedGuide = generatePersonalizedGuide;
exports.testOpenAIConnection = testOpenAIConnection;
var openai_1 = require("openai");
// 다국어 프롬프트 생성 함수
function getMultilingualPrompts(language, disasterType) {
    var prompts = {
        ko: {
            systemRole: "당신은 재난 안전 전문가입니다. 사용자의 개인 정보와 현재 상황을 고려하여 맞춤형 재난 대응 가이드를 JSON 형식으로만 응답합니다. 예시나 템플릿 텍스트가 아닌 실제 개인화된 내용을 생성하세요."
        },
        en: {
            systemRole: "You are a disaster safety expert. Generate customized disaster response guides considering user's personal information and current situation. Respond only in JSON format. Do not use template or example text - provide actual personalized content."
        },
        vi: {
            systemRole: "Bạn là chuyên gia an toàn thảm họa. Tạo hướng dẫn ứng phó thảm họa tùy chỉnh dựa trên thông tin cá nhân và tình huống hiện tại của người dùng. Chỉ trả lời bằng định dạng JSON. Không sử dụng văn bản mẫu hoặc ví dụ - cung cấp nội dung được cá nhân hóa thực tế."
        },
        zh: {
            systemRole: "您是灾难安全专家。根据用户的个人信息和当前情况生成定制化的灾难应对指南。仅以JSON格式回复。不要使用模板或示例文本 - 提供实际个性化内容。"
        },
    };
    return prompts[language] || prompts["ko"];
}
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY_ENV_VAR ||
        "default_key",
});
// 한국수어 지원을 위한 수어 키워드 추출
function extractKSLKeywords(text, disasterType) {
    if (disasterType === void 0) { disasterType = 'unknown'; }
    var kslDictionary = [
        '지진', '화재', '홍수', '태풍', '대피', '안전', '위험', '즉시',
        '병원', '학교', '집', '밖으로', '아래로', '도움', '연락', '준비'
    ];
    // 텍스트에서 수어 단어 추출
    var foundKeywords = kslDictionary.filter(function (keyword) { return text.includes(keyword); });
    // 재난 유형별 필수 키워드 추가
    var disasterKeywords = {
        'earthquake': ['지진', '대피', '안전'],
        'fire': ['화재', '대피', '위험'],
        'flood': ['홍수', '위험', '안전'],
        'typhoon': ['태풍', '위험', '준비']
    };
    var essentialKeywords = disasterKeywords[disasterType] || ['안전', '대피'];
    return Array.from(new Set(__spreadArray(__spreadArray([], foundKeywords, true), essentialKeywords, true))).slice(0, 5);
}
/**
 * OpenAI를 사용하여 사용자 맞춤형 재난 대응 가이드 생성
 */
function generatePersonalizedGuide(request) {
    return __awaiter(this, void 0, void 0, function () {
        var disasterTypeKo, mobilityKo, prompts, userPrompt, response, content, result, parsedContent, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    disasterTypeKo = "지진";
                    mobilityKo = request.userProfile.mobility === "assisted"
                        ? "이동 지원 필요"
                        : request.userProfile.mobility === "unable"
                            ? "이동 불가"
                            : "독립적 이동 가능";
                    prompts = getMultilingualPrompts(request.userProfile.language, disasterTypeKo);
                    userPrompt = "\uD83D\uDEA8 \uAE34\uAE09 \uC7AC\uB09C \uC0C1\uD669 - \uB9DE\uCDA4\uD615 \uC0DD\uBA85\uBCF4\uD638 \uAC00\uC774\uB4DC \uC694\uCCAD\n\n\uD83D\uDC64 \uC0AC\uC6A9\uC790 \uC815\uBCF4:\n- \uB098\uC774: ".concat(request.userProfile.age, "\uC138 (\uACE0\uB839\uC790/\uC131\uC778/\uCCAD\uC18C\uB144\uC5D0 \uB9DE\uB294 \uD589\uB3D9\uB2A5\uB825 \uACE0\uB824)\n- \uC131\uBCC4: ").concat(request.userProfile.gender || "미상", "  \n- \uC774\uB3D9\uB2A5\uB825: ").concat(mobilityKo, " (\uB3C5\uB9BD\uC801/\uC81C\uD55C\uC801/\uD720\uCCB4\uC5B4 \uB4F1)\n- \uC811\uADFC\uC131 \uC7A5\uC560: ").concat(request.userProfile.accessibility.join(", ") || "없음", " (\uC2DC\uAC01/\uCCAD\uAC01/\uC2E0\uCCB4 \uC7A5\uC560 \uACE0\uB824)\n- \uD604\uC7AC \uC8FC\uC18C: ").concat(request.userProfile.address, "\n\n\uD83C\uDF0D \uC7AC\uB09C \uC0C1\uD669:\n- \uC7AC\uB09C \uC720\uD615: ").concat(disasterTypeKo, " (\uAD6C\uCCB4\uC801 \uB300\uC751\uBC95 \uC801\uC6A9)\n- \uD604\uC7AC \uC704\uCE58: ").concat(request.situation.locationContext, " (\uAC74\uBB3C \uB0B4\uBD80/\uC678\uBD80/\uD2B9\uC218\uACF5\uAC04)\n- \uC774\uB3D9 \uAC00\uB2A5\uC131: ").concat(request.situation.canMove ? "이동 가능" : "이동 제한", " (\uB300\uD53C \uC804\uB7B5 \uACB0\uC815)\n\n\u26A0\uFE0F \uC0DD\uBA85\uBCF4\uD638 \uC6B0\uC120 \uC6D0\uCE59\uC5D0 \uB530\uB77C \uC2E4\uC81C \uAC1C\uC778\uD654\uB41C \uC7AC\uB09C \uB300\uC751 \uB9E4\uB274\uC5BC\uC744 \uC0DD\uC131\uD558\uC138\uC694:\n\n\u2705 primaryActions: \uAC01 \uB2E8\uACC4\uBCC4\uB85C \uAD6C\uCCB4\uC801\uC774\uACE0 \uC2E4\uD589 \uAC00\uB2A5\uD55C \uD589\uB3D9 \uC9C0\uCE68 (\uB2E8\uC21C \uB2E8\uACC4\uBA85\uC774\uB098 \uC608\uC2DC \uD14D\uC2A4\uD2B8 \uC808\uB300 \uAE08\uC9C0)\n\u2705 safetyTips: ").concat(request.userProfile.age, "\uC138 + ").concat(request.userProfile.accessibility.join("/"), " \uC7A5\uC560 + ").concat(mobilityKo, " \uD2B9\uC131\uC744 \uBC18\uC601\uD55C \uC2E4\uC81C\uC801 \uC548\uC804 \uC218\uCE59  \n\u2705 specialConsiderations: \uC0AC\uC6A9\uC790 \uAC1C\uBCC4 \uD2B9\uC131\uC5D0 \uD2B9\uD654\uB41C \uC8FC\uC758\uC0AC\uD56D (\uB098\uC774/\uC7A5\uC560/\uC774\uB3D9\uB2A5\uB825 \uAD6C\uCCB4\uC801 \uACE0\uB824)\n\u2705 emergencyContacts: \uD55C\uAD6D \uC2E4\uC815\uC5D0 \uB9DE\uB294 \uC751\uAE09 \uC5F0\uB77D\uCC98\n\n\uD83D\uDCDA \uC2E0\uB8B0\uC131 \uB192\uC740 \uC815\uBD80\uAE30\uAD00 \uB9E4\uB274\uC5BC \uAE30\uBC18 \uC815\uBCF4:\n").concat(((_a = request.relevantManuals) === null || _a === void 0 ? void 0 : _a.map(function (manual, idx) { return "".concat(idx + 1, ". ").concat(manual); }).join('\n')) || '기본 매뉴얼 적용', "\n\n\uBAA8\uB4E0 \uB0B4\uC6A9\uC740 \uC2E4\uC81C \uC0C1\uD669\uC5D0\uC11C \uC989\uC2DC \uC2E4\uD589\uD560 \uC218 \uC788\uB294 \uAD6C\uCCB4\uC801\uC774\uACE0 \uAC1C\uC778\uD654\uB41C \uC9C0\uCE68\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.\n\uB2E4\uC74C JSON \uD615\uC2DD\uC73C\uB85C **").concat(request.userProfile.language === "ko" ? "한국어" : request.userProfile.language === "en" ? "영어" : request.userProfile.language === "vi" ? "베트남어" : "중국어", "**\uB85C \uC751\uB2F5\uD574\uC8FC\uC138\uC694:\n\n{\n  \"guide\": {\n    \"primaryActions\": [\n      \"\uC0AC\uC6A9\uC790 \uD2B9\uC131\uC5D0 \uB9DE\uB294 \uAD6C\uCCB4\uC801 \uD589\uB3D91\",\n      \"\uC0AC\uC6A9\uC790 \uD2B9\uC131\uC5D0 \uB9DE\uB294 \uAD6C\uCCB4\uC801 \uD589\uB3D92\", \n      \"\uC0AC\uC6A9\uC790 \uD2B9\uC131\uC5D0 \uB9DE\uB294 \uAD6C\uCCB4\uC801 \uD589\uB3D93\",\n      \"\uC0AC\uC6A9\uC790 \uD2B9\uC131\uC5D0 \uB9DE\uB294 \uAD6C\uCCB4\uC801 \uD589\uB3D94\"\n    ],\n    \"safetyTips\": [\n      \"").concat(request.userProfile.age, "\uC138 ").concat(request.userProfile.accessibility.join(","), " \uC7A5\uC560 \uACE0\uB824\uD55C \uC548\uC804\uC218\uCE59\",\n      \"").concat(mobilityKo, " \uC774\uB3D9\uB2A5\uB825 \uBC18\uC601\uD55C \uB9DE\uCDA4 \uC9C0\uCE68\",\n      \"\uC9C0\uC9C4 \uC7AC\uB09C \uD2B9\uC131 \uAE30\uBC18 \uC2E4\uD589\uAC00\uB2A5\uD55C \uC8FC\uC758\uC0AC\uD56D\"\n    ],\n    \"specialConsiderations\": [\n      \"").concat(request.userProfile.age, "\uC138 \uACE0\uB839\uC790/\uC131\uC778/\uCCAD\uC18C\uB144 \uD2B9\uBCC4 \uACE0\uB824\uC0AC\uD56D\",\n      \"").concat(request.userProfile.accessibility.join("/"), " \uC7A5\uC560 \uD2B9\uD654 \uC8FC\uC758\uC0AC\uD56D\", \n      \"").concat(mobilityKo, " \uC774\uB3D9 \uD2B9\uC131 \uBC18\uC601\uD55C \uB300\uD53C \uC804\uB7B5\"\n    ],\n    \"emergencyContacts\": [\n      \"119 (\uC7AC\uB09C\uC2E0\uACE0\uC13C\uD130) - \uC989\uC2DC \uC5F0\uB77D\",\n      \"\uAC00\uC871/\uB3D9\uD589\uD30C\uD2B8\uB108 \uBE44\uC0C1 \uC5F0\uB77D\uB9DD \uD65C\uC131\uD654\"\n    ]\n  },\n  \"audioText\": \"\uC0AC\uC6A9\uC790 \uAC1C\uC778 \uD2B9\uC131\uC744 \uBC18\uC601\uD55C \uC0C1\uC138 \uC74C\uC131 \uC548\uB0B4\",\n  \"estimatedReadingTime\": 180\n}\n\n\u26A0\uFE0F \uC911\uC694: \uC704 JSON \uAD6C\uC870\uB294 \uCC38\uACE0\uC6A9\uC774\uBA70, \uC2E4\uC81C \uB0B4\uC6A9\uC740 \uC0AC\uC6A9\uC790\uC758 \uB098\uC774(").concat(request.userProfile.age, "\uC138), \uC774\uB3D9\uB2A5\uB825(").concat(mobilityKo, "), \uC811\uADFC\uC131 \uC694\uAD6C\uC0AC\uD56D(").concat(request.userProfile.accessibility.join(", ") || "없음", ")\uC744 \uBC18\uC601\uD55C \uAD6C\uCCB4\uC801\uC774\uACE0 \uC2E4\uC6A9\uC801\uC778 \uAC1C\uC778\uD654\uB41C \uC870\uC5B8\uC744 \uC81C\uACF5\uD558\uC138\uC694. \uC608\uC2DC \uD14D\uC2A4\uD2B8\uB97C \uADF8\uB300\uB85C \uBC18\uD658\uD558\uC9C0 \uB9C8\uC138\uC694.");
                    console.log("🤖 OpenAI API 호출 시작:", {
                        model: "gpt-4o",
                        promptLength: userPrompt.length,
                        userAge: request.userProfile.age,
                        userLanguage: request.userProfile.language,
                        disasterType: disasterTypeKo,
                    });
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: "gpt-4o", // Using GPT-4o for better personalization
                            messages: [
                                {
                                    role: "system",
                                    content: prompts.systemRole,
                                },
                                {
                                    role: "user",
                                    content: userPrompt,
                                },
                            ],
                            response_format: { type: "json_object" },
                            temperature: 0.3,
                            max_tokens: 2000,
                        })];
                case 1:
                    response = _c.sent();
                    console.log("✅ OpenAI API 응답 수신:", {
                        choices: response.choices.length,
                        contentLength: ((_b = response.choices[0].message.content) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    });
                    content = response.choices[0].message.content;
                    if (!content) {
                        throw new Error("OpenAI 응답이 비어있습니다");
                    }
                    result = void 0;
                    try {
                        parsedContent = JSON.parse(content);
                        console.log("🔍 파싱된 응답 구조:", JSON.stringify(parsedContent, null, 2));
                        // OpenAI 응답 구조가 예상과 다를 수 있으므로 확인 후 변환
                        if (parsedContent.guide) {
                            result = parsedContent;
                        }
                        else {
                            // 직접 가이드 내용만 있는 경우 래핑
                            result = {
                                guide: parsedContent,
                                audioText: parsedContent.audioText || "지진이 발생했습니다. 즉시 대피하세요.",
                                estimatedReadingTime: parsedContent.estimatedReadingTime || 3
                            };
                        }
                    }
                    catch (parseError) {
                        console.error("❌ JSON 파싱 오류:", parseError);
                        console.log("원본 응답:", content);
                        // 파싱 실패시 기본 응답 구조 반환
                        result = {
                            guide: {
                                primaryActions: [
                                    "즉시 머리와 목을 보호하세요",
                                    "튼튼한 테이블 아래로 피하세요",
                                    "흔들림이 멈출 때까지 기다리세요",
                                    "안전한 경로로 대피하세요"
                                ],
                                safetyTips: [
                                    "엘리베이터를 사용하지 마세요",
                                    "계단을 이용해 천천히 대피하세요",
                                    "낙하물에 주의하세요"
                                ],
                                specialConsiderations: [
                                    "개인 이동 능력에 따른 대피",
                                    "주변 도움 요청하기",
                                    "비상용품 준비"
                                ],
                                emergencyContacts: ["119", "112", "1588-3650"]
                            },
                            audioText: "지진이 발생했습니다. 즉시 대피하세요.",
                            estimatedReadingTime: 2
                        };
                    }
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _c.sent();
                    console.error("❌ OpenAI API 호출 오류:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * API 테스트용 함수
 */
function testOpenAIConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("🔧 OpenAI API 테스트 시작...");
                    console.log("🔧 API Key 존재 여부:", !!process.env.OPENAI_API_KEY);
                    console.log("🔧 API Key 앞 10자리:", (_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.substring(0, 10));
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
                            messages: [
                                {
                                    role: "user",
                                    content: "테스트용 간단한 응답을 해주세요.",
                                },
                            ],
                            max_tokens: 10,
                        })];
                case 1:
                    response = _b.sent();
                    console.log("✅ OpenAI API 테스트 성공");
                    return [2 /*return*/, {
                            success: true,
                            message: "OpenAI API 호출 성공",
                            result: response.choices[0].message.content || "테스트 성공",
                            usage: response.usage,
                        }];
                case 2:
                    error_2 = _b.sent();
                    console.error("❌ OpenAI API 테스트 실패:", error_2);
                    return [2 /*return*/, {
                            success: false,
                            message: "OpenAI API 호출 실패",
                            error: error_2.message,
                            usage: null,
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
