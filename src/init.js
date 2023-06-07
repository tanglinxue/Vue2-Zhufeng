import { initState } from './state'
import { compileToFunction } from './compiler/index'
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options
    initState(vm)
    if (options.el) {
      vm.$mount(options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el)
    let opts = vm.$options;
    console.log(el)
    if (!opts.render) {// 如果用户没有自己写 render 函数
      let template
      if (el) {
        if (opts.template) {
          template = opts.template //这里不考虑兼容性细节，直接用 outerHTML 获取整个元素字符串
        } else {
          template = el.outerHTML
        }
      }

      if (template) {// 这里就拿到了用户传入的 template 或是 el 转化的 template 字符串
        // 在这里对模板进行编译
        const render = compileToFunction(template)
        opts.render = render
      }
    }
  }
}


