
import { mergeOptions } from './utils'

export function initGlobAPI(Vue) {
  Vue.options = {}// 全局选项
  /**
   * 将传入的选项混合到全局选项中
   * @param {object} mixin 要混合的选项
   * @returns 返回 Vue，可以链式调用
   */
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin) // 将 mixin 混合到 Vue.options 中
    return this  // 返回 Vue 可以链式调用
  }
}



