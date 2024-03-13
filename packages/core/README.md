# vite-plugin-mixin-code

- ### 自动添加大驼峰PascalCase命名方式的组件名
  - 工程下的所有vue文件，以当前文件名作为组件名，若文件名为 index，则取上级文件夹名称。首字符大写，名称中若有字母数字符号组成，则会剔除左右的符号，只保留中间
  - 在所有组合是脚本和选项式脚本中都起作用
  - 将字符串中的 - 或 _ 作为PascalCase转换点。
  - 官方的defineOptions优先级最高。
  
- ### 实现对指目录下的 vue 文件进行代码合并，
  - 功能类似全局 mixin，但比 mixn 更强大。
  - 可以通过指定具体文件/夹和排除指定文件/夹来实现合并
  - 合并规则：以现有组件对象为主，并入的对象为辅， 相同函数合并成一个，并入的函数先执行。函数有返回值:若为对象则合并，结果都以组件内的函数结果为主
  - 同时支持多个不同的匹配规则
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
  项目中统一自动加上组件name。
```

# 使用方式

```javascript
plugins.push( MixinCodePlugin())

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
