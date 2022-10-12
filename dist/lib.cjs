"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeObject = exports.isType = void 0;
const lodash_es_1 = require("lodash-es");
/**
 * @description 类型判断
 * @author 闰月飞鸟
 * @param obj 校验对象
 * @param type 校验类型，可以是字符串或数组，数组为或结果。值为所有类型的实例化名。如Object，Number...
 *  */
const isType = (obj, type) => {
    if (typeof type === 'string')
        return Object.prototype.toString.call(obj) == `[object ${type}]`;
    if (Array.isArray(type))
        return type.some((t) => Object.prototype.toString.call(obj) == `[object ${t}]`);
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
                return async function (...res) {
                    const resObj = await objValue.bind(this)(...res);
                    const resSrc = await srcValue.bind(this)(...res);
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
            else
                return function (...res) {
                    const resObj = objValue.bind(this)(...res);
                    const resSrc = srcValue.bind(this)(...res);
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
