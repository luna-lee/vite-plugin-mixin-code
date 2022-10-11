# vite-plugin-mixin-code
- 实现对制定目录下的vue文件进行代码合并，
- 功能类型全局mixin，但比mixn更强大。
- 可以通过指定具体文件/夹和排除指定文件/夹来实现合并
- 相同函数合并成一个，并且原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主

 
# 参数
``` javascript
 interface ExtendOptions {
    mixinCode?: string; //插入的代码。
    method?: 'mixin' | 'merge'; //插入方式，通过mixin或直接合并。合并规则，对象合并，相同函数合并成一个，原函数先执行,若函数有返回值:若为对象则合并，非对象的以来源函数结果为主
    include?: string[]; //指定文件/夹 默认当前工程下所有vue文件
    exclude?: string[]; //排除文件/夹
    projectPath?: string; //手动指定项目根路径，取process.cwd()
}
```
# 应用场景
```javascript
  小程序开发，当需要将所有第三方组件设置成虚拟节点时。
  H5开发，当需要将某一类文件统一添加属性或方法时。
```
# 使用方式
``` javascript
  plugins.push(
            mixinCodePlugin({
                mixinCode: `{	
                 options: {
                    virtualHost: true
                  } 
                }
                `,
                // 排除所有路由页面文件
                exclude: pagesPath,
                projectPath: __dirname
            })
);
```