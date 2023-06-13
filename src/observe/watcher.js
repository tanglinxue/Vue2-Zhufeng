import Dep from './dep'

let id = 0;
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++
    this.renderWatcher = options
    this.getter = fn; //getter意味着调用这个函数可以发生取值操作
    this.deps = []
    this.depsId = new Set()
    this.get()
  }
  get() {
    Dep.target = this; //静态属性就是只有一份
    this.getter()
    Dep.target = null
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this) //watcher已经记住了dep了而且去重，此时让dep也记住watcher
    }
  }
  update() {
    queueWatcher(this)
  }
  run() {
    this.get()
  }
}

let queue = [];
let has = {};
let pending = false

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)
  queue = [];
  has = {};
  pending = false
  flushQueue.forEach(q => q.run())
}
function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    if (!pending) {
      setTimeout(flushSchedulerQueue, 0)
      pending = true
    }
  }
}

//需要给每个属性增加一个dep
//一个组件中有多少个属性，(n个属性会对应一个视图) ，n个dep对应一个watcher
//一个属性对应多个视图
export default Watcher
