import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'

function Vue(options) {
  this._init(options)
}
initMixin(Vue)// 传递Vue的同时扩展了_init 方法
initLifeCycle(Vue)  // 扩展 _update、_render 方法

Vue.prototype.$nextTick = nextTick
//通过方法传递 Vue，然后在方法中添加原型方法



Vue.options = {}

function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) {
    mergeFiled(key)
  }
  for (let key in child) {
    if (!parent.hasOwnPerperty(key)) {
      mergeFiled(key)
    }
  }
  function mergeFiled(key) {
    options[key] = child[key] || parent[key];
  }
  return options
}

Vue.mixin = function (mixin) {
  this.options = mergeOptions(this.options, mixin)
  return this
}

export default Vue
