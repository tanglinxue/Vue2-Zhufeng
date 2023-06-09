
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;   // aa-aa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // aa:aa 命名空间字符串
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function parseHTML(html) {
  const ELEMETN_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [] //用于存放元素的
  let currentParent;//指向的是栈中的最后一个
  let root;

  //最终需要转化成一颗抽象语法树
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMETN_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  //利用栈型解构来构造一棵树
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs) //创造一个ast节点
    if (!root) {//看一下是否是空树
      root = node//如果为空则当前是树的根节点
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node  //currentParent为栈中的最后一个
  }
  function chars(text) {
    text = text.replace(/\s/g, '')
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  function end(tag) {
    stack.pop() //弹出最后一个
    currentParent = stack[stack.length - 1]
  }
  function advance(length) {
    html = html.substring(length)
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], //标签名
        attrs: []
      }
      advance(start[0].length)
      // 如果不是开始标签的结束就一直匹配下去
      let attr, end;
      while (!(end = html.match(startTagClose))) {
        attr = html.match(attribute)
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
        advance(attr[0].length)
      }
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false
  }
  while (html) {
    //textEnd如果为0说明是一个开始标签或者结束标签
    let textEnd = html.indexOf('<');
    if (textEnd == 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd)//文本内容
      if (text) {
        chars(text)
        advance(text.length)
      }
    }
  }
  return root
}
