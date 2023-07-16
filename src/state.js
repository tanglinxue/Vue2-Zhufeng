import { observe } from './observe/index'

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data; // 这个data就是 new Vue时传入的data，可能是函数也可能是对象
  data = typeof data === 'function' ? data.call(vm) : data// 如果是函数则执行函数拿到返回值
  vm._data = data;   // 将 data 对象缓存到 _data 中
  observe(data) // 劫持 data，为 data 中的属性添加 getter 和 setter

  for (let key in data) {
    proxy(vm, '_data', key)//将vm._data 用vm来代理就可以了
  }
}


/**
 * 将 vm[key] 代理到 vm[target][key] 上
 * @param {object} vm 上下文
 * @param {string} target 要代理的目标
 * @param {string} key 要代理的属性
 */
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]   // 访问 vm.name 返回 vm._data.name
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}

