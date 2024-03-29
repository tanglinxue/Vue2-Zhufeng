import { parseHTML, ELEMENT_TYPE } from './parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

/**
 * 将传入的 ast 语法树拼接成 render 函数需要的返回值
 * @param {object} ast ast 语法树
 * @returns 返回 render 函数需要的返回值字符串
 */
function codegen(ast) {
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`
  return code
}

/**
 * 根据传入的 attrs 数组拼接属性字符串
 * @param {array} attrs 属性数组
 * @returns 返回一串属性字符串
 */
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {  // 对 style 属性做特殊处理
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key.trim()] = value.trim() // trim 去掉可能存在的空格
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`  // JSON.stringify 会将 value 值转化为字符串
  }
  return `{${str.slice(0, -1)}}`   // 去除字符串中最后的逗号和空格
}

/**
 * 拼接传入的节点，如果是元素类型则继续解析，如果是文本类型则拼接字符
 * @param {object} node 要拼接的节点
 * @returns 返回拼接后的字符串
 */
function gen(node) {
  if (node.type === ELEMENT_TYPE) {  // 节点是元素类型
    return codegen(node) // 继续拼接
  } else {  // 节点是文本类型
    let text = node.text;
    if (!defaultTagRE.test(text)) {  // 文本中没有 {{}} 表达式
      return `_v(${JSON.stringify(text)})`
    } else {  // 文本中包含 {{}} 表达式
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0; // 重置正则的下标，这样下面 exec 结果才不会出错
      let lastIndex = 0; // 用于比对匹配正则后的下标，来截取文本中非表达式的子文本
      while (match = defaultTagRE.exec(text)) {
        let index = match.index; // 匹配的位置，'{{name}} hello {{age}} hello' 第一次返回 0，第二次返回 15
        if (index > lastIndex) { // 第二次匹配时，index 在 '{{age}}' 开头，lastIndex 在 ' hello ' 开头
          tokens.push(JSON.stringify(text.slice(lastIndex, index))) // 截取 ' hello ' 字符串
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        /**
        * 匹配完成后，lastIndex 小于文本长度证明文本最后还有一串不是表达式的字符串
        * '{{name}} hello {{age}}' 不会走这个逻辑
        * '{{name}} hello {{age}} hello' 就会走这个逻辑
        */
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

/**
 * 将传入的子节点数组拼接成子节点字符串
 * @param {array} children 要拼接的子节点数组
 * @returns 返回子节点字符串
 */
function genChildren(children) {

  return children.map(child => gen(child)).join(',')
}




/**
 * 将传入的模板 template 编译成 ast 语法树，生成 render 方法
 * @param {string} template 要编译的模板字符串
 * @returns 返回 render 函数
 */
export function compileToFunction(template) {
  //1.就是将template转化成ast语法树
  let ast = parseHTML(template)
  //2.生成render方法(render方法执行后的返回结果就是虚拟DOM)
  let code = codegen(ast)
  code = `with(this){return ${code}}`  // 使用 with 确保 code 中的变量取值正确
  let render = new Function(code) // 根据 code 生成 render 函数，模板引擎实现原理：with + new Function

  return render
}
