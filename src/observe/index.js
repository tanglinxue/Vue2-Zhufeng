
import { newArrayProto } from './array'
import Dep from './dep'
class Observe {
  constructor(data) {
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    })
    //给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测过
    //Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的不知道
    if (Array.isArray(data)) {
      //这里我们可以重写数组中的方法，7个变异方法,是可以修改数组本身的
      data.__proto__ = newArrayProto
      this.observeArray(data)//如果数组中放的是对象，是可以监控到对象的变化
    } else {
      this.walk(data)// 对 data 进行遍历，劫持属性
    }

  }
  walk(data) {
    //重新定义属性
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}

export function defineReactive(target, key, value) {
  //闭包
  observe(value)//对所有的对象都进行属性劫持
  let dep = new Dep()//每个属性都有一个dep
  Object.defineProperty(target, key, {
    get() {//取值的时候会执行get
      return value
    },
    set(newValue) {//修改的时候会执行set
      if (newValue === value) return
      value = newValue
      observe(newValue)
    }
  })
}


export function observe(data) {
  if (typeof data !== 'object' || data === null) {
    return  // 只对对象进行劫持
  }
  // 如果一个对象被劫持过了，就不需要再被劫持
  // 而要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断
  // 这里先不加这段逻辑，后面章节会加
  // if (data.__ob__ instanceof Observe) {
  //   return data.__ob__
  // }
  return new Observe(data)
}

