import Dep from './dep'

let id = 0;  // watcher 标识，0 表示为根组件的 watcher
class Watcher {
  /**
 * 观察者，用于观察视图组件中用到的数据，一个 watcher 观察一个组件
 * 数据发生变化，watcher 就更新视图
 * @param {object} vm watcher 对应的组件实例
 * @param {function} fn 渲染逻辑，核心是 vm._update(vm._render())
 * @param {boolean} options true 表明是一个渲染 Watcher
 */
  constructor(vm, fn, options) {
    this.id = id++  // 每个 watcher 的标识
    this.renderWatcher = options  // true 为渲染 Watcher
    this.getter = fn; // 取名 getter 是因为 fn 中有在 vm 上取值的操作，调用 getter 就会取值并渲染
    this.deps = []  // 记录 watcher 下有多少个数据 dep，记录的目的是后续实现计算属性以及进行一些清理工作
    this.depsId = new Set() // 利用 Set 和 dep 的 id 来去重
    this.get()
  }
  get() {
    Dep.target = this; // 将当前 watcher 存放到 Dep.target 中
    this.getter()  // getter 中 _render() 会去 vm 上取值，触发数据的 get 拦截逻辑
    Dep.target = null
  }

  /**
   * 让 watcher 记录下 dep，相同的 dep 只记录一次
   * @param {Dep} dep 要记录的 dep
   */
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) { // 当前 dep 没有记录
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this) //watcher已经记住了dep了而且去重，此时让dep也记住watcher
    }
  }

  /**
  * 数据改变时，dep 就会通知 watcher 更新视图
  * react 是整棵树更新，vue 是组件级更新
  */
  update() {
    queueWatcher(this)
  }
  run() {
    console.log('run')
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
      nextTick(flushSchedulerQueue, 0)
      pending = true
    }
  }
}


let callbacks = []
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0)
  waiting = false;
  callbacks = []
  cbs.forEach(cb => cb())
}

let timerFunc
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode()
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2
  }
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}


export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    timerFunc()
    waiting = true
  }
}
//需要给每个属性增加一个dep
//一个组件中有多少个属性，(n个属性会对应一个视图) ，n个dep对应一个watcher
//一个属性对应多个视图
export default Watcher
