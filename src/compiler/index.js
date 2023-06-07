const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;   // aa-aa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // aa:aa 命名空间字符串
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function compileToFunction(template) {
  console.log(template)
  //1.就是将template转化成ast语法树
  //2.生成render方法(render方法执行后的返回结果就是虚拟DOM)
}
function parseHTML(html) {
  function advance(length) {
    html = html.substring(length)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
  }
}
