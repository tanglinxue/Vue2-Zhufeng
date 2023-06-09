import { parseHTML } from './parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g


function gen(node) {

}

function genChildren() {

}
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}
function codegen(ast) {
  let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'})${ast.genChildren}`
  console.log(code)
  return code
}

export function compileToFunction(template) {
  //1.就是将template转化成ast语法树
  let ast = parseHTML(template)
  console.log(ast)
  //2.生成render方法(render方法执行后的返回结果就是虚拟DOM)
  codegen(ast)
}
