# vite-plugin-mixin-code

- 实现对制定目录下的 vue 文件进行代码合并，
- 功能类似全局 mixin，但比 mixn 更强大。
- 可以通过指定具体文件/夹和排除指定文件/夹来实现合并
- 相同函数合并成一个，并且原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
- 支持多个不同匹配规则的插入
- 文件筛选匹配格式 参考[micromatch](https://github.com/micromatch/micromatch)

# 参数

```javascript
export interface MixinOptionsType {
  mixinCode: string; //插入的代码。
  include?: string[]; //指定文件/夹 默认当前工程下所有vue文件【"**/*"】。
  exclude?: string[]; //排除文件/夹 默认【】
}
export interface ExtendOptionsType {
  method?: "mixin" | "merge"; //mixin插入方式，通过mixin或直接合并。合并规则，对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:merge:若为对象则合并，非对象的以来源函数结果为主
  projectPath?: string; //手动指定项目根路径，取process.cwd()
}
MixinOptionsType 可以是数组或对象，数组时可以适配多个不同匹配规则的插入代码。若有多个插入代码片段，则会合并。合并规则，对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
```

# 应用场景

```javascript
  小程序开发，当需要将所有第三方组件设置成虚拟节点时。
  H5开发，当需要将某一类文件统一添加属性或方法时。
```

# 使用方式

```javascript
plugins.push(
  MixinCodePlugin(
    [
      {
        mixinCode: `
                        {	
                            options: {
                                virtualHost: true
                            } 
                        }
                     `,
        exclude: ["src/view/component/*.vue"], // 排除所有路由页面文件
      },
      {
        mixinCode: `
                        {	
                            options: {
                                virtualHost22: true
                            } 
                        }
                     `,
        exclude: ["src/view/component/*.vue"], // 排除所有路由页面文件
      },
    ],
    {
      projectPath: __dirname,
      method: "mixin",
    }
  )
);
plugins.push(
  MixinCodePlugin(
    {
      mixinCode: `
                        {	
                            options: {
                                virtualHost: true
                            } 
                        }
                     `,
      exclude: ["src/view/component/*.vue"], // 排除所有路由页面文件
    },
    {
      projectPath: __dirname,
      // method: 'mixin'
    }
  )
);
```
