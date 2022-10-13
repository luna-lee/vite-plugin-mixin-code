import { Plugin } from "vite";
import { parse, compileScript } from "@vue/compiler-sfc";
import MagicString from "magic-string";
const path = require("path");
const micromatch = require("micromatch");
const absolutePath = (projectPath = process.cwd(), ...arg: any) =>
  path.resolve(projectPath, ...arg);
export interface MixinOptionsType {
  mixinCode: string; //插入的代码。
  include?: string[]; //指定文件/夹 默认当前工程下所有vue文件
  exclude?: string[]; //排除文件/夹
}
export interface ExtendOptionsType {
  method?: "mixin" | "merge"; //插入方式，通过mixin或直接合并。合并规则，对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
  projectPath?: string; //手动指定项目根路径，取process.cwd()
}
/**
 * @author lip
 * @description 对指定文件夹下的.vue文件进行代码混入，类似设置全局mixin（小程序组件不支持全局设置全局mixin）.
 * @description 默认正对整个项目中的vue文件
 */
export default function mixinCodePlugin(
  mixinOptions: MixinOptionsType[] | MixinOptionsType,
  extendOptions: ExtendOptionsType = {
    method: "merge",
    projectPath: process.cwd(),
  }
): Plugin {
  return {
    name: "vite:mixin-code",
    enforce: "pre",
    transform(code, id) {
      if (!/\.vue$/.test(id)) {
        return null;
      }
      const projectPath = extendOptions.projectPath;
      let mixinCode = "";
      let method = extendOptions.method;
      if (Array.isArray(mixinOptions)) {
        // 将所有符合匹配规则的，mixinCode进行合并,合并规则后替换前
        mixinCode = mixinOptions
          .filter((o: MixinOptionsType) => {
            const { include = ["**/*"], exclude = [] } = o;

            return micromatch.isMatch(
              id,
              include.map((v) =>
                absolutePath(projectPath, v).replace(/\\/g, "/")
              ),
              {
                ignore: exclude.map((v) =>
                  absolutePath(projectPath, v).replace(/\\/g, "/")
                ),
              }
            );
          })
          .reduce((str: string, o: MixinOptionsType): string => {
            if (o.mixinCode) {
              if (!str) {
                str = o.mixinCode;
              } else {
                str = `VitePluginMixinCodeMergeObject(
                                    ${str}
                                    ,
                                   ${o.mixinCode}
                                    )`;
              }
            }
            return str;
          }, "");
      } else {
        const {
          mixinCode: _mixinCode,
          include = ["**/*"],
          exclude = [],
        } = mixinOptions;
        const fileMatch = micromatch.isMatch(
          id,
          include.map((v) => absolutePath(projectPath, v).replace(/\\/g, "/")),
          {
            ignore: exclude.map((v) =>
              absolutePath(projectPath, v).replace(/\\/g, "/")
            ),
          }
        );
        if (fileMatch) mixinCode = _mixinCode;
      }
      if (!mixinCode) {
        return null;
      }
      try {
        const o = (0, eval)(
          `(${mixinCode.replace(
            /VitePluginMixinCodeMergeObject/g,
            " Object.assign"
          )})`
        );
        if (Object.prototype.toString.call(o) != "[object Object]") {
          throw {
            msg: "vite-plugin-mixin-code插件中 mixinCode 格式错误!请确保为对象类型！",
          };
        }
      } catch (error: any) {
        if (error.msg) throw error.msg;
        else throw `vite-plugin-mixin-code插件中 mixinCode 编码错误:${error}`;
      }

      let s: MagicString | undefined;
      const str = () => s || (s = new MagicString(code));
      const { descriptor } = parse(code);
      if (descriptor.script && /export\s+default\s*/.test(code)) {
        if (method == "mixin") {
          const mixinsRegx = /mixins\s*:\s*\[/gms;
          if (mixinsRegx.test(code)) {
            const contextRegx = /(?<=(mixins\s*:))\s*\[((?!\[).)*]/gms;
            str().replace(contextRegx, (match) => {
              return `${match}.concat([
                                ${mixinCode}
                            ])`;
            });
          } else {
            str().replace(/(export\s+default\s*)((?!{).)*{/gms, (match) => {
              return `
                                        ${match}\n mixins:[
                                        ${mixinCode}
                                     ],
                                 `;
            });
          }
        } else {
          const result = compileScript(descriptor, { id });
          const s = result.content.replace(
            /(?<=(export\s+default\s*)).*(}|\))/gms,
            (match) => {
              if (/defineComponent\(/.test(match))
                return match.replace(
                  /(?<=(defineComponent\s*\()).*(?=\))/gms,
                  (m) => {
                    return `VitePluginMixinCodeMergeObject(${m}, ${mixinCode})`;
                  }
                );
              else
                return `
                                    VitePluginMixinCodeMergeObject(${match}, ${mixinCode})
                                    `;
            }
          );
          str().replace(result.content, s);
        }
        return {
          map: str().generateMap(),
          code: str()
            .toString()
            // 若代码中有VitePluginMixinCodeMergeObject,添加VitePluginMixinCodeMergeObject依赖
            .replace(/export\s+default.*/gms, (match) => {
              if (
                /import\s+\{\s*mergeObject\s+as\s+VitePluginMixinCodeMergeObject\s*\}/gms.test(
                  code
                )
              )
                return match;
              if (/VitePluginMixinCodeMergeObject/gms.test(match))
                return `
                                import { mergeObject as VitePluginMixinCodeMergeObject  } from '${__dirname}/lib/index';\n
                                ${match}
                            `;
              return match;
            }),
        };
      } else if (descriptor.scriptSetup) {
        const result = compileScript(descriptor, { id });
        const lang = result.attrs.lang;
        if (method == "mixin") {
          str().appendLeft(
            0,
            `<script ${lang ? `lang="${lang}"` : ""}>
                        import { defineComponent } from 'vue'
                        export default defineComponent({
                            mixins:[
                                ${mixinCode}
                            ]
                        })
                        </script>\n
                        `
          );
        } else {
          str().appendLeft(
            0,
            `<script ${lang ? `lang="${lang}"` : ""}>
                        import { defineComponent } from 'vue'
                        export default defineComponent(
                            ${mixinCode}
                        )
                        </script>\n
                        `
          );
        }
        return {
          map: str().generateMap(),
          code: str()
            .toString()
            // 若代码中有VitePluginMixinCodeMergeObject,添加VitePluginMixinCodeMergeObject依赖
            .replace(/export\s+default.*/gms, (match) => {
              if (
                /import\s+\{\s*mergeObject\s+as\s+VitePluginMixinCodeMergeObject\s*\}/gms.test(
                  code
                )
              )
                return match;
              if (/VitePluginMixinCodeMergeObject/gms.test(match))
                return `
                            import { mergeObject as VitePluginMixinCodeMergeObject  } from '${__dirname}/lib/index';\n
                            ${match}
                        `;
              return match;
            }),
        };
      } else {
        return null;
      }
    },
  };
}
