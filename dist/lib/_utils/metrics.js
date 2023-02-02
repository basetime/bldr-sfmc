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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementMetric = void 0;
const axios_1 = __importDefault(require("axios"));
const incrementMetric = (metric, count = 1) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.post(`https://us-central1-bldr-io-dev.cloudfunctions.net/bldrAPI/api/v1/cli/increment/${metric}`, {
            count,
        });
    }
    catch (err) { }
});
exports.incrementMetric = incrementMetric;
