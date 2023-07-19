const strats = {}
const LIFECYCLE = [
  'beforeCreated',
  'created'
]

LIFECYCLE.forEach(hook => {
  strats[hook] = function (parent, child) {
    if (child) {
      if (parent) { // 父亲儿子都有，拼在一起
        return parent.concat(child)
      } else {// 只有儿子，将儿子包装成数组
        return [child]
      }
    } else { // 没有儿子，直接返回父亲
      return parent
    }
  }
})
// data、computed 等也是用策略模式来混入，这里暂时不实现
// strats.data = function () {}
// strats.computed = function () {}

/**
 * 将 child 选项混合到 parent 中然后返回
 * @param {object} parent 要混入的目标对象，一般为 Vue.options
 * @param {object} child 要混入的参数对象
 */
export function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) { // 先循环 parent
    mergeFiled(key)// parent 的属性先从 child 取值，如果 child 没有再取 parent 原来的值
  }
  for (let key in child) {
    if (!parent.hasOwnPerperty(key)) {
      mergeFiled(key) // 混合 parent 没有的属性
    }
  }
  /**
 * 优先从 child 上取值，child 没有再从 parent 上取值
 * @param {string} key 属性名
 */
  function mergeFiled(key) {
    if (strats[key]) { // 如果 key 出现在策略对象中
      options[key] = strats[key](parent[key], child[key])  // 需要调用策略函数来混入
    } else {
      options[key] = child[key] || parent[key];// 不在策略对象中则直接覆盖或取原来的值
    }
  }
  return options
}
