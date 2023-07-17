import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {// 用于初始化操作
    const vm = this;
    vm.$options = options  // 将用户的选项挂载到实例上
    initState(vm) // 初始化状态
    if (options.el) {
      vm.$mount(options.el) // $mount 实现数据的挂载，渲染数据
    }
  }
  /**
  * 实现数据的挂载，将数据渲染到指定的元素上
  * @param {string} el 指定的元素，一般为元素 id
  */
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el) // 获取到元素
    let opts = vm.$options;
    if (!opts.render) {// 如果用户没有自己写 render 函数
      let template
      if (el) {
        if (opts.template) {
          template = opts.template
        } else {
          template = el.outerHTML //这里不考虑兼容性细节，直接用 outerHTML 获取整个元素字符串
        }
      }
      if (template) {// 这里就拿到了用户传入的 template 或是 el 转化的 template 字符串
        // 在这里对模板进行编译
        const render = compileToFunction(template)
        opts.render = render
      }
    }
    mountComponent(vm, el)//组件的挂载
  }
}

//compilerToFunction 方法要做的有两件事：
//将 template 编译成 ast 语法树。
//生成 render 方法，render() 返回的就是虚拟 DOM。


