
import { newArrayProto } from './array'
import Dep from './dep'
class Observe {
  constructor(data) {
    // this 就是 Observer 类的实例，放在 data 的自定义属性上
    // 这样在 array.js 中就可以调用到 Observer 实例的方法
    // 同时下方的 observe 方法也可以通过判断数据是否有 __ob__ 标识来判断对象是否劫持观测过
    Object.defineProperty(data, '__ob__', {//给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测过
      value: this,
      enumerable: false   // 将 __ob__ 变为不可枚举
    })
    //Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的不知道
    if (Array.isArray(data)) {// 如果 data 是数组
      //这里我们可以重写数组中的方法，7个变异方法,是可以修改数组本身的
      //将数组的原型指向我们重写后的新原型，以此保留数组原有方法，同时重写 7 个数组操作方法
      data.__proto__ = newArrayProto
      this.observeArray(data)//对 data 数组的每一项做劫持
    } else {
      this.walk(data)// 对data进行遍历，劫持属性
    }
  }
  /**
  * 循环 data 对象，对属性进行劫持，为 data 对象 “重新定义” 属性
  * @param {object} data 要循环劫持属性的对象
  */
  walk(data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  /**
   * 对 data 数组的每一项做劫持，如果子项是对象就会劫持
   * @param {array} data 要劫持子项的数组
   */
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}


/**
 * 对对象的某个属性进行劫持，添加 getter 和 setter
 * @param {object} target 劫持对象
 * @param {string} key 劫持属性
 * @param {*} value 属性值
 */
export function defineReactive(target, key, value) {
  // 下面的 get 和 set 是闭包，在读取或设置 target[key] 时 value 不会销毁
  observe(value)// 递归对对象的属性值也进行劫持，递归结束条件在 observe 函数中
  let dep = new Dep()//每个属性都有一个dep

  Object.defineProperty(target, key, {
    get() {//取值的时候会执行get
      if (Dep.target) {  // 只有在模板里用到的数据，渲染时才会进行依赖收集
        dep.depend() // 让这个数据的收集器 dep 收集当前 watcher
      }
      return value
    },
    set(newValue) {//修改的时候会执行set
      if (newValue === value) return
      observe(newValue) // 如果设置的值是对象，还得对这个对象进行劫持
      value = newValue // 这里将新值赋值给 value，这样当取值执行 get 时拿到的就是新值，因为闭包不会销毁
      dep.notify()  // 数据改变，让 dep 通知 watcher 更新视图
    }
  })
}


/**
 * 对数据对象进行劫持，给其属性添加 getter 和 setter
 * @param {object} data 要劫持的数据对象
 */
export function observe(data) {
  if (typeof data !== 'object' || data === null) {
    return  // 只对对象进行劫持
  }
  // 如果一个对象被劫持过了，就不需要再被劫持
  // 而要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断
  // 这里先不加这段逻辑，后面章节会加
  if (data.__ob__ instanceof Observe) {
    return data.__ob__
  }
  return new Observe(data)
}

