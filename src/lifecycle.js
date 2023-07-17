
import Watcher from './observe/watcher';
import { createElementVNode, createTextVNode } from "./vdom/index";
import { patch } from './vdom/patch'

/**
 * 扩展 _update、_render 方法
 * @param {object} Vue 给 Vue 扩展 _update、_render 方法
 */
export function initLifeCycle(Vue) {
  /**
   * 根据虚拟 DOM 产生真实 DOM
   * @param {object} vnode 虚拟 DOM
   */
  Vue.prototype._update = function (vnode) {
    const el = this.$el;
    this.$el = patch(el, vnode)
  }
  Vue.prototype._render = function () {
    // render 中用 with 来绑定作用域，所以需要用 call 调用执行
    return this.$options.render.call(this)//通过ast语法转义后生成的render
  }

  /**
 * 将对象变量进行 JSON.stringify 转义
 * @param {any} value 尝试转义为字符串的变量
 * @returns 转义后的字符串
 */
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
  /**
  * 创建虚拟元素节点
  * @param {string} tag 元素名
  * @param {object} props 属性
  * @param {...any} children 子元素，后面参数都是
  * @returns 一个虚拟的元素 vnode 节点
  */
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }

  /**
  * 创建虚拟文本节点
  * @param {string} text 文本内容
  * @returns 一个虚拟的文本 vnode 节点
  */
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
}

//vue核心流程  1.创造了响应式数据 2.模板转换成ast语法树
//3.将ast语法树转换了render函数 4.后续每次数据更新可以只执行render函数 无需再次执行ast转化的流程

//render函数会产生虚拟节点(使用响应式数据)
//根据生成的虚拟节点创造真实的DOM

/**
 * 1. 调用 render 方法产生虚拟 DOM
 * 2. 根据虚拟 DOM 产生真实 DOM
 * 3. 将真实 DOM 插入到 el 元素中
 * @param {object} vm 调用 vm.$options.render 生成 vnode
 * @param {object} el 将 vnode 转化为 dom 然后插入 el 元素中
 */
export function mountComponent(vm, el) {
  // vm._render 方法通过 vm.$options.render 方法生成虚拟 DOM
  // vm._update 方法根据虚拟 DOM 产生真实 DOM
  vm.$el = el
  //调用render方法产生虚拟节点
  const updateComponent = () => {
    vm._update(vm._render())
  }

  // 将渲染逻辑放到 watcher 中，true 表示是一个渲染 Watcher
  const watcher = new Watcher(vm, updateComponent, true)

}
