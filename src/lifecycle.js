
import { createElementVNode, createTextVNode } from "./vdom/index";

function createElm(vnode) {
  let { tag, props, children, text } = vnode;
  let data = props
  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, data)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; //获取真实元素
    const parentElm = elm.parentNode; //拿到父元素
    console.log(vnode)
    let newElm = createElm(vnode)
    parentElm.insertBefore(newElm, elm.nextSibling)
    parentElm.removeChild(elm)
    return newElm
  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    const el = this.$el;
    this.$el = patch(el, vnode)
  }
  Vue.prototype._render = function () {
    return this.$options.render.call(this)//通过ast语法转义后生成的render
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
}

//vue核心流程  1.创造了响应式数据 2.模板转换成ast语法树
//3.将ast语法树转换了render函数 4.后续每次数据更新可以只执行render函数 无需再次执行ast转化的流程

//render函数会产生虚拟节点(使用响应式数据)
//根据生成的虚拟节点创造真实的DOM
export function mountComponent(vm, el) {
  vm.$el = el
  //调用render方法产生虚拟节点
  vm._update(vm._render())



  //根据虚拟DOM产生真实DOM

  //插入到el元素中
}
