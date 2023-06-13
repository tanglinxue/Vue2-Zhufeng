
let id = 0
class Dep {
  constructor() {
    this.id = id++;
    this.subs = [] //这里存放着当前属性对应的watcher有哪些
  }
  depend() {
    //让watcher记住dep
    Dep.target.addDep(this)
    // 这里我们不希望放重复的watcher，而且刚才只是一个单向的关系
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null
export default Dep
