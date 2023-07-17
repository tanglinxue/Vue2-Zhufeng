/**
 * 创建虚拟元素 vnode，也是 new Vue 时 render 函数的 h 参数
 * @param {object} vm 表明该元素 vnode 是哪个 Vue 实例的虚拟节点
 * @param {string} tag 元素名
 * @param {object} data 元素属性对象
 * @param {...any} children 子元素，后面参数都是
 * @returns 一个虚拟元素 vnode
 */
export function createElementVNode(vm, tag, data, ...children) {
  if (data == null) { // data 为空则初始化为空对象
    data = {}
  }
  let key = data.key; // diff 算法需要用到的 key
  if (key) {
    delete data.key   // 取出 key 后从 data 中删除
  }
  return vnode(vm, tag, key, data, children)
}

/**
 * 创建虚拟文本 vnode
 * @param {object} vm 表明该文本 vnode 是哪个 Vue 实例的虚拟节点
 * @param {string} text 文本内容
 * @returns 一个虚拟文本 vnode
 */
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}


/**
 * 用于创建虚拟节点
 * @param {object} vm 表明该虚拟节点属于哪个 Vue 实例
 * @param {string} tag 元素名
 * @param {string} key diff 算法用到的 key
 * @param {object} data 元素属性
 * @param {array} children 子元素列表
 * @param {string} text 元素文本内容
 * @returns 返回一个 vnode
 */
//ast一样吗?ast做的是语法层面的转化，他描述的是语法本身(可以描述js css html)
//我们的虚拟dom是描述的dom元素，可以增加一些自定义属性(描述dom的)
function vnode(vm, tag, key, props, children, text) {
  return {
    vm, tag, key, props, children, text
  }
}
