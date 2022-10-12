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
var path = require("path");
var micromatch = require("micromatch");
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
function mixinCodePlugin(mixinOptions, extendOptions) {
    if (extendOptions === void 0) { extendOptions = {
        method: "merge",
        projectPath: process.cwd()
    }; }
    return {
        name: "vite:mixin-code",
        enforce: "pre",
        transform: function (code, id) {
            if (!/\.vue$/.test(id)) {
                return null;
            }
            var projectPath = extendOptions.projectPath;
            var mixinCode = "";
            var method = extendOptions.method;
            if (Array.isArray(mixinOptions)) {
                // 将所有符合匹配规则的，mixinCode进行合并,合并规则后替换前
                mixinCode = mixinOptions
                    .filter(function (o) {
                    var _a = o.include, include = _a === void 0 ? ["**/*"] : _a, _b = o.exclude, exclude = _b === void 0 ? [] : _b;
                    return micromatch.isMatch(id, include.map(function (v) {
                        return absolutePath(projectPath, v).replace(/\\/g, "/");
                    }), {
                        ignore: exclude.map(function (v) {
                            return absolutePath(projectPath, v).replace(/\\/g, "/");
                        })
                    });
                })
                    .reduce(function (str, o) {
                    if (o.mixinCode) {
                        if (!str) {
                            str = o.mixinCode;
                        }
                        else {
                            str = "VitePluginMixinCodeMergeObject(\n                                    " + str + "\n                                    ,\n                                   " + o.mixinCode + "\n                                    )";
                        }
                    }
                    return str;
                }, "");
            }
            else {
                var _mixinCode = mixinOptions.mixinCode, _a = mixinOptions.include, include = _a === void 0 ? ["**/*"] : _a, _b = mixinOptions.exclude, exclude = _b === void 0 ? [] : _b;
                var fileMatch = micromatch.isMatch(id, include.map(function (v) { return absolutePath(projectPath, v).replace(/\\/g, "/"); }), {
                    ignore: exclude.map(function (v) {
                        return absolutePath(projectPath, v).replace(/\\/g, "/");
                    })
                });
                if (fileMatch)
                    mixinCode = _mixinCode;
            }
            if (!mixinCode) {
                return null;
            }
            try {
                var o = (0, eval)("(" + mixinCode.replace(/VitePluginMixinCodeMergeObject/g, " Object.assign") + ")");
                if (Object.prototype.toString.call(o) != "[object Object]") {
                    throw {
                        msg: "vite-plugin-mixin-code插件中 mixinCode 格式错误!请确保为对象类型！"
                    };
                }
            }
            catch (error) {
                if (error.msg)
                    throw error.msg;
                else
                    throw "vite-plugin-mixin-code\u63D2\u4EF6\u4E2D mixinCode \u7F16\u7801\u9519\u8BEF:" + error;
            }
            var s;
            var str = function () { return s || (s = new magic_string_1["default"](code)); };
            var descriptor = (0, compiler_sfc_1.parse)(code).descriptor;
            if (descriptor.script && /export\s+default\s*/.test(code)) {
                if (method == "mixin") {
                    var mixinsRegx = /mixins\s*:\s*\[/gms;
                    if (mixinsRegx.test(code)) {
                        var contextRegx = /(?<=(mixins\s*:))\s*\[((?!\[).)*]/gms;
                        str().replace(contextRegx, function (match) {
                            return match + ".concat([\n                                " + mixinCode + "\n                            ])";
                        });
                    }
                    else {
                        str().replace(/(export\s+default\s*)((?!{).)*{/gms, function (match) {
                            return "\n                                        " + match + "\n mixins:[\n                                        " + mixinCode + "\n                                     ],\n                                 ";
                        });
                    }
                }
                else {
                    var result = (0, compiler_sfc_1.compileScript)(descriptor, { id: id });
                    var s_1 = result.content.replace(/(?<=(export\s+default\s*)).*(}|\))/gms, function (match) {
                        if (/defineComponent\(/.test(match))
                            return match.replace(/(?<=(defineComponent\s*\()).*(?=\))/gms, function (m) {
                                return "VitePluginMixinCodeMergeObject(" + m + ", " + mixinCode + ")";
                            });
                        else
                            return "\n                                    VitePluginMixinCodeMergeObject(" + match + ", " + mixinCode + ")\n                                    ";
                    });
                    str().replace(result.content, s_1);
                }
                return {
                    map: str().generateMap(),
                    code: str()
                        .toString()
                        // 若代码中有VitePluginMixinCodeMergeObject,添加VitePluginMixinCodeMergeObject依赖
                        .replace(/export\s+default.*/gms, function (match) {
                        if (/import\s+\{\s*mergeObject\s+as\s+VitePluginMixinCodeMergeObject\s*\}/gms.test(code))
                            return match;
                        if (/VitePluginMixinCodeMergeObject/gms.test(match))
                            return "\n                                import { mergeObject as VitePluginMixinCodeMergeObject  } from '" + __dirname + "/lib';\n\n                                " + match + "\n                            ";
                        return match;
                    })
                };
            }
            else if (descriptor.scriptSetup) {
                var result = (0, compiler_sfc_1.compileScript)(descriptor, { id: id });
                var lang = result.attrs.lang;
                if (method == "mixin") {
                    str().appendLeft(0, "<script " + (lang ? "lang=\"" + lang + "\"" : "") + ">\n                        import { defineComponent } from 'vue'\n                        import { mergeObject as VitePluginMixinCodeMergeObject  } from '" + __dirname + "/lib';\n\n                        export default defineComponent({\n                            mixins:[\n                                " + mixinCode + "\n                            ]\n                        })\n                        </script>\n\n                        ");
                }
                else {
                    str().appendLeft(0, "<script " + (lang ? "lang=\"" + lang + "\"" : "") + ">\n                        import { defineComponent } from 'vue'\n                        import { mergeObject as VitePluginMixinCodeMergeObject  } from '" + __dirname + "/lib';\n\n                        export default defineComponent(\n                            " + mixinCode + "\n                        )\n                        </script>\n\n                        ");
                }
                return {
                    map: str().generateMap(),
                    code: str()
                        .toString()
                        // 若代码中有VitePluginMixinCodeMergeObject,添加VitePluginMixinCodeMergeObject依赖
                        .replace(/export\s+default.*/gms, function (match) {
                        if (/import\s+\{\s*mergeObject\s+as\s+VitePluginMixinCodeMergeObject\s*\}/gms.test(code))
                            return match;
                        if (/VitePluginMixinCodeMergeObject/gms.test(match))
                            return "\n                            import { mergeObject as VitePluginMixinCodeMergeObject  } from '" + __dirname + "/lib';\n\n                            " + match + "\n                        ";
                        return match;
                    })
                };
            }
            else {
                return null;
            }
        }
    };
}
exports["default"] = mixinCodePlugin;
