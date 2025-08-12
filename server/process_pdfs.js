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
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var ragService_js_1 = require("./services/ragService.js"); // Adjust path if necessary
var pdfFiles = [
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\국민재난안전포탈_지진.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\2.시각장애인+지진+재난대응+안내서.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\8.그+밖의+장애인+지진+재난대응+안내서.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\1. 이동이 어려운 장애인을 위한 재난 안전 가이드.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\2. 계단 이동이 어려운 장애인을 위한 재난 안전 가이드.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\3. 시각 정보 습득이 어려운 장애인을 위한 재난 안전 가이드.pdf",
    "C:\\SafeCompass\\SafeCompass-1\\attached_assets\\4. 의미 이해가 어려운 장애인을 위한 재난 안전 가이드.pdf"
];
function processPdfs() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, pdfFiles_1, filePath, originalName, metadata, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting PDF processing for RAG...");
                    _i = 0, pdfFiles_1 = pdfFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < pdfFiles_1.length)) return [3 /*break*/, 6];
                    filePath = pdfFiles_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    originalName = path.basename(filePath);
                    console.log("\uD83D\uDCC4 Processing: ".concat(originalName));
                    metadata = {
                        title: path.basename(originalName, '.pdf'),
                        disasterType: 'earthquake', // Default
                        category: 'government', // Default
                        source: '정부 공식 매뉴얼' // Default
                    };
                    // Infer disaster type
                    if (originalName.includes('화재') || originalName.includes('fire')) {
                        metadata.disasterType = 'fire';
                    }
                    else if (originalName.includes('홍수') || originalName.includes('flood')) {
                        metadata.disasterType = 'flood';
                    }
                    else if (originalName.includes('태풍') || originalName.includes('typhoon')) {
                        metadata.disasterType = 'typhoon';
                    }
                    else if (originalName.includes('지진') || originalName.includes('earthquake')) {
                        metadata.disasterType = 'earthquake';
                    }
                    // Infer category and source
                    if (originalName.includes('장애') || originalName.includes('accessibility')) {
                        metadata.category = 'accessibility';
                        metadata.source = '접근성 특화 안전 매뉴얼';
                    }
                    else if (originalName.includes('고령') || originalName.includes('elderly')) {
                        metadata.category = 'elderly';
                        metadata.source = '고령자 안전 매뉴얼';
                    }
                    return [4 /*yield*/, ragService_js_1.ragService.addPDFManual(filePath, metadata)];
                case 3:
                    _a.sent();
                    console.log("\u2705 Successfully processed: ".concat(originalName));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C Failed to process ".concat(filePath, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, ragService_js_1.ragService.saveKnowledgeBase()];
                case 7:
                    _a.sent();
                    console.log("💾 Knowledge base saved successfully.");
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error("❌ Failed to save knowledge base:", error_2);
                    return [3 /*break*/, 9];
                case 9:
                    console.log("PDF processing complete.");
                    return [2 /*return*/];
            }
        });
    });
}
processPdfs();
