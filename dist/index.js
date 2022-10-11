"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var compiler_sfc_1 = require("@vue/compiler-sfc");
var magic_string_1 = require("magic-string");
var path = require('path');
var micromatch = require('micromatch');
var absolutePath = function (projectPath) {
    if (projectPath === void 0) { projectPath = process.cwd(); }
    var arg = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        arg[_i - 1] = arguments[_i];
    }
    return path.resolve.apply(path, __spreadArray([projectPath], arg, false));
};
/**
 * @author lip
 * @description 对指定文件夹下的.vue文件进行代码混入，类似设置全局mixin（小程序组件不支持全局设置全局mixin）.
 * @description 默认正对整个项目中的vue文件
 */
function mixinCodePlugin(options) {
    if (options === void 0) { options = {}; }
    return {
        name: 'vite:mixin-code',
        enforce: 'pre',
        transform: function (code, id) {
            var _a = options.mixinCode, mixinCode = _a === void 0 ? '' : _a, _b = options.method, method = _b === void 0 ? 'merge' : _b, _c = options.include, include = _c === void 0 ? ['**/*'] : _c, _d = options.exclude, exclude = _d === void 0 ? [] : _d, _e = options.projectPath, projectPath = _e === void 0 ? process.cwd() : _e;
            var fileMatch = micromatch.isMatch(id, include.map(function (v) { return absolutePath(projectPath, v).replace(/\\/g, '/'); }), {
                ignore: exclude.map(function (v) { return absolutePath(projectPath, v).replace(/\\/g, '/'); })
            });
            try {
                var o = (0, eval)("(" + mixinCode + ")");
                if (Object.prototype.toString.call(o) != '[object Object]') {
                    throw { msg: 'vite-plugin-mixin-code插件中 mixinCode 格式错误!请确保为对象类型！' };
                }
            }
            catch (error) {
                if (error.msg)
                    throw error.msg;
                else
                    throw "vite-plugin-mixin-code\u63D2\u4EF6\u4E2D mixinCode \u7F16\u7801\u9519\u8BEF:" + error;
            }
            if (!/\.vue$/.test(id) || !mixinCode || !fileMatch) {
                return null;
            }
            var s;
            var str = function () { return s || (s = new magic_string_1["default"](code)); };
            var descriptor = (0, compiler_sfc_1.parse)(code).descriptor;
            if (descriptor.script) {
                var regx = /export\s+default\s*(defineComponent\s*\()?\s*{/;
                if (regx.test(code)) {
                    if (method == 'mixin') {
                        var mixinsRegx = /mixins\s*:\s*\[/gms;
                        if (mixinsRegx.test(code)) {
                            var contextRegx = /(?<=(mixins\s*:))\s*\[((?!\[).)*]/gms;
                            str().replace(contextRegx, function (match) {
                                return match + ".concat([\n                                " + mixinCode + "\n                            ])";
                            });
                        }
                        else {
                            str().replace(regx, function (match) {
                                return "\n                                        " + match + "\n mixins:[\n                                        " + mixinCode + "\n                                     ],\n                                 ";
                            });
                        }
                    }
                    else {
                        var result = (0, compiler_sfc_1.compileScript)(descriptor, { id: id });
                        var s_1 = result.content
                            .replace(/(?<=(export\s+default\s*)).*}/gms, function (match) {
                            if (/defineComponent\(/.test(match))
                                return match.replace(/(?<=(defineComponent\s*\()).*}/gms, function (m) {
                                    return "mergeObject(" + m + ", " + mixinCode + ")";
                                });
                            else
                                return "\n                                        mergeObject(" + match + ", " + mixinCode + ")\n                                    ";
                        })
                            .replace(/export\s+default.*}/gms, function (match) {
                            return "\n                                import { mergeObject } from '" + __dirname + "/lib';\n\n                                " + match + "\n                                ";
                        });
                        str().replace(result.content, s_1);
                    }
                    return {
                        map: str().generateMap(),
                        code: str().toString()
                    };
                }
            }
            else if (descriptor.scriptSetup) {
                var result = (0, compiler_sfc_1.compileScript)(descriptor, { id: id });
                var lang = result.attrs.lang;
                if (method == 'mixin') {
                    str().appendLeft(0, "<script " + (lang ? "lang=\"" + lang + "\"" : '') + ">\n                        import { defineComponent } from 'vue'\n                        export default defineComponent({\n                            mixins:[\n                                " + mixinCode + "\n                            ]\n                        })\n                        </script>\n\n                        ");
                }
                else {
                    str().appendLeft(0, "<script " + (lang ? "lang=\"" + lang + "\"" : '') + ">\n                        import { defineComponent } from 'vue'\n                        export default defineComponent(\n                            " + mixinCode + "\n                        )\n                        </script>\n\n                        ");
                }
                return {
                    map: str().generateMap(),
                    code: str().toString()
                };
            }
            else {
                return null;
            }
        }
    };
}
exports["default"] = mixinCodePlugin;
