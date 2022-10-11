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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.mergeObject = exports.isType = void 0;
var lodash_es_1 = require("lodash-es");
/**
 * @description 类型判断
 * @author 闰月飞鸟
 * @param obj 校验对象
 * @param type 校验类型，可以是字符串或数组，数组为或结果。值为所有类型的实例化名。如Object，Number...
 *  */
var isType = function (obj, type) {
    if (typeof type === 'string')
        return Object.prototype.toString.call(obj) == "[object " + type + "]";
    if (Array.isArray(type))
        return type.some(function (t) { return Object.prototype.toString.call(obj) == "[object " + t + "]"; });
    return true;
};
exports.isType = isType;
/**
 * @description 对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
 * @author 闰月飞鸟
 * @param to 原对象
 * @param from 待合并的来源对象
 * @return 返回一个新的对象
 *  */
function mergeObject(to, from) {
    function customizer(objValue, srcValue) {
        if (typeof objValue === 'function' && typeof srcValue === 'function') {
            if (typeof objValue.then === 'function' || typeof srcValue.then === 'function')
                return function () {
                    var res = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        res[_i] = arguments[_i];
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var resObj, resSrc;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, objValue.bind(this).apply(void 0, res)];
                                case 1:
                                    resObj = _a.sent();
                                    return [4 /*yield*/, srcValue.bind(this).apply(void 0, res)];
                                case 2:
                                    resSrc = _a.sent();
                                    if ((0, exports.isType)(resObj, 'Object') && (0, exports.isType)(resSrc, 'Object')) {
                                        return [2 /*return*/, mergeObject(resObj, resSrc)];
                                    }
                                    else if ((0, exports.isType)(resObj, 'Array') && (0, exports.isType)(resSrc, 'Array')) {
                                        return [2 /*return*/, resObj.concat(resSrc)];
                                    }
                                    else {
                                        return [2 /*return*/, resSrc];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
            else
                return function () {
                    var res = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        res[_i] = arguments[_i];
                    }
                    var resObj = objValue.bind(this).apply(void 0, res);
                    var resSrc = srcValue.bind(this).apply(void 0, res);
                    if ((0, exports.isType)(resObj, 'Object') && (0, exports.isType)(resSrc, 'Object')) {
                        return mergeObject(resObj, resSrc);
                    }
                    else if ((0, exports.isType)(resObj, 'Array') && (0, exports.isType)(resSrc, 'Array')) {
                        return resObj.concat(resSrc);
                    }
                    else {
                        return resSrc;
                    }
                };
        }
        if ((0, exports.isType)(objValue, 'Array') && (0, exports.isType)(srcValue, 'Array')) {
            return objValue.concat(srcValue);
        }
    }
    return (0, lodash_es_1.mergeWith)(to, from, customizer);
}
exports.mergeObject = mergeObject;
