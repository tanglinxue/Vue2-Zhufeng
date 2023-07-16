import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {// 用于初始化操作
    const vm = this;
    vm.$options = options  // 将用户的选项挂载到实例上
    initState(vm) // 初始化状态
    if (options.el) {
      vm.$mount(options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el)
    let opts = vm.$options;
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
    mountComponent(vm, el)//组件的挂在
  }
}


