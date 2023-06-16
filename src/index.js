import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { nextTick } from './observe/watcher'

function Vue(options) {
  this._init(options)
}


Vue.prototype.$nextTick = nextTick
//通过方法传递 Vue，然后在方法中添加原型方法
initMixin(Vue)// 传递 Vue 的同时扩展了 _init 方法
initLifeCycle(Vue)

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
