import { observe } from './observe/index'
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm)
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newValue) {
      vm[target][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data; // 这个data就是 new Vue时传入的data，可能是函数也可能是对象
  data = typeof data === 'function' ? data.call(vm) : data// 如果是函数则执行函数拿到返回值

  vm._data = data;
  observe(data)

  //将vm._data 用vm来代理就可以了
  for (let key in data) {
    proxy(vm, '_data', key)
  }
}
