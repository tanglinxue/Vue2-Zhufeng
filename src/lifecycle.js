
import { createElementVNode, createTextVNode } from "./vdom/index";
export function mountComponent(vm, el) {
    console.log(vm._render())
    //调用render方法产生虚拟节点
    vm._update(vm._render())



    //根据虚拟DOM产生真实DOM

    //插入到el元素中
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
        console.log('update2')
    }
    Vue.prototype._render = function () {
        console.log('222')
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
