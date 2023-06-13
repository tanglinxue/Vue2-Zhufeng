import Dep from './dep'

let id = 0;
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++
    this.renderWatcher = options
    this.getter = fn; //getter意味着调用这个函数可以发生取值操作
    this.deps = []
    this.get()
  }
  get() {
    Dep.target = this; //静态属性就是只有一份
    this.getter()
    Dep.target = null

  }
}

//需要给每个属性增加一个dep
//一个组件中有多少个属性，(n个属性会对应一个视图) ，n个dep对应一个watcher
//一个属性对应多个视图
export default Watcher
