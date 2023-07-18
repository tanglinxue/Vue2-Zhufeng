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
    queueWatcher(this)  // 把当前要更新渲染的 watcher 暂存起来
  }
  run() {
    console.log('run')
    this.get()
  }
}

let queue = []; // 存 watcher 的队列
let has = {}; // 用于去重的对象
let pending = false  // 防抖的控制变量


/**
 * 刷新并调度队列，从队列中取出目前要更新渲染的 watcher 进行更新，然后清空队列
 */
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0) // 复制一份
  queue = [];   // 清空当前队列，后面进来的 watcher 就等下一次调度
  has = {};
  pending = false // 开始调度后将 pending 置为 false，这样此时再有数据改变，那么其 watcher 就会再入队列等待下一次调度
  flushQueue.forEach(watcher => watcher.run())  // 让队列中的 watcher 进行更新渲染
}

/**
 * 将要更新渲染的 watcher 缓存起来，在执行完同步代码后，开始执行异步代码时再统一更新渲染
 * @param {Watcher} watcher 要缓存的 watcher
 */
function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {  // 这里对 watcher 进行去重，这样保证一个组件下多个数据同时更新也只触发一次渲染
    queue.push(watcher)  // 缓存 watcher
    has[id] = true // 用于去重
    if (!pending) {
      nextTick(flushSchedulerQueue, 0) // 同步代码中数据全部改变后再执行异步任务 flushSchedulerQueue
      pending = true
    }
  }
}

let callbacks = []  // 存放 nextTick 异步的回调函数
let waiting = false; // 是否批处理回调函数的标识

/**
 * 对 nextTick 传入的回调函数队列进行批处理
 */
function flushCallbacks() {
  let cbs = callbacks.slice(0) // 拷贝一份
  waiting = false;  // 重置防抖标识
  callbacks = []// 清空
  cbs.forEach(cb => cb())// 依次调用队列中的回调函数
}

/**
 * 将传入的回调函数 cb 放入队列中维护，先传入的 cb 后面批处理时会先调用
 * 当同一轮事件循环中的同步代码执行完成后，就会从队列中依次调用回调函数
 * 用于统一用户使用的异步方式和底层源码使用的异步方式
 * @param {function} cb 要异步调用的回调函数
 */
let timerFunc
if (Promise) { // 支持 promise
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
  }
} else if (MutationObserver) { //h5 的 api，也是微任务。
  let observer = new MutationObserver(flushCallbacks)   // 传入的回调函数是异步执行的
  let textNode = document.createTextNode()
  observer.observe(textNode, {  // observer 监控 textNode 内容，内容发生改变就执行 flushCallbacks()
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2
  }
} else if (setImmediate) { //ie 专享，性能比 setTimeout 好一点。
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}


export function nextTick(cb) {
  callbacks.push(cb)// 将回调放入队列中
  if (!waiting) {
    timerFunc()   // 等这个事件循环中的同步代码执行完毕后，再对回调队列进行批处理
    waiting = true
  }
}
//需要给每个属性增加一个dep
//一个组件中有多少个属性，(n个属性会对应一个视图) ，n个dep对应一个watcher
//一个属性对应多个视图
export default Watcher
