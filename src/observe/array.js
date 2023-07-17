// 我们希望重写数组中的部分方法，Vue 中利用了装饰器模式中 aop 切片编程的思想，重写一个功能，功能内部涵盖以前的功能。

let oldArrayProto = Array.prototype;//获取数组的原型

export let newArrayProto = Object.create(oldArrayProto)  // newArrayProto.__proto__ 指向 oldArrayProto

let methods = [//找到所有的变异方法， 7 个会修改原数组的方法列表
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
    let ob = this.__ob__; // this.__ob__ 保存着 index.js 中的 Observer 类实例
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        // splice 方法第一个参数是起始索引，第二个参数是删除个数，第三个参数开始就是新增的数据
        inserted = args.splice(2)
        break
    }
    if (inserted) {
      ob.observeArray(inserted) // 对数组新增内容进行观测
    }
    return result
  }
})
