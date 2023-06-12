
let id = 0
class Dep {
  constructor() {
    this.id = id++;
    this.subs = [] //这里存放着当前属性对应的watcher有哪些
  }
  depend() {
    this.subs.push(Dep.target)
  }
}

Dep.target = null
export default Dep
