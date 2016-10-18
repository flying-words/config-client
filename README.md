# limijiaoyin-octopus-client

limijiaoyin config-servers‘ Node.js client library

### Install

```bash
$ npm install --save git+ssh://git@git.limijiaoyin.com:2222/limijiaoyin/limijiaoyin-octopus-client.git
```

### Usage

假设服务器端的配置数据是：

```yaml
hello:
	world: "limijiaoyin"
```

通过 octopus-client 加载配置：

```javascript
var config = require('limijiaoyin-octopus-client');

config.load(host, token, env).then(() => {
  console.log(config.get('hello.world')); // load 方法成功返回之后可以使用 get 方法获取数据
});
```

程序成功执行之后应该输出 "limijiaoyin"

### Methods

__load(host, token, env)__ 加载配置，是一个基于 Promise 的异步方法：

* host: config-server 的访问域名
* token: config-server 发放的 token
* env: 要加载的配置版本

__get(path)__ 获取配置数据，是一个同步方法：

* path: 配置属性的访问路径，使用 "." 分隔，比如："husky.trello"