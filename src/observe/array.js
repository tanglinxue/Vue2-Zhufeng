// 我们希望重写数组中的部分方法
let oldArrayProto = Array.prototype;//获取数组的原型

export let newArrayProto = Object.create(oldArrayProto)

let methods = [//找到所有的变异方法
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]
//concat slice 都不会改变原数组


methods.forEach(method => {
  newArrayProto[method] = function (...args) {//这里重写了数组的方法
    let result = oldArrayProto[method].call(this, ...args)//内部调用原来的方法，函数的劫持，切片编程

    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.splice(2)
        break
    }
    if (inserted) {
      ob.observeArray(inserted)
    }
    return result
  }
})
