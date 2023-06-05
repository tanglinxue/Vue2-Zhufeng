import { initMixin } from './init'

function Vue(options) {
  this._init(options)
}


//通过方法传递 Vue，然后在方法中添加原型方法
initMixin(Vue)// 传递 Vue 的同时扩展了 _init 方法

export default Vue
