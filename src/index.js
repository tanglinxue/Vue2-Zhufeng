import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'
import { initGlobAPI } from './global.js'

function Vue(options) {
  this._init(options)
}
initMixin(Vue)// 传递Vue的同时扩展了_init 方法
initLifeCycle(Vue)  // 扩展 _update、_render 方法
initGlobAPI(Vue)

Vue.prototype.$nextTick = nextTick
//通过方法传递 Vue，然后在方法中添加原型方法


export default Vue
