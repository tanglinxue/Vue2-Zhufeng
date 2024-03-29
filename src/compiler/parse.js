
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;   // aa-aa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // aa:aa 命名空间字符串
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配到的分组是一个开始标签名，如 <div 或带命名空间的 <div:xxx，注意不带 > 符号
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
// 匹配属性，第一个分组是属性的 key，第二个分组是 = 号，第三、四、五分组是属性的 value 值
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的 > 符号或自闭和标签，如 <div> 中的 > 或 <br />
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export const ELEMENT_TYPE = 1  // 元素类型
export const TEXT_TYPE = 3  // 文本类型
/**
 * 解析传入的 html 字符串，生成 ast 语法树，注意这里没有处理注释节点，并且没有支持单标签
 * @param {string} html 要解析的 html 字符串
 *  @returns 将 html 字符串解析成的 ast 语法树
 */
export function parseHTML(html) {
  const stack = [] // 用于存放元素的栈，用栈来构造一棵树
  let currentParent;// 指针，指向栈中最后一个，也就是下一个开始标签或文本的父亲
  let root; // ast 树的根节点

  /**
   * 用于创建 ast 语法树的一个节点
   * @param {string} tag 节点标签名
   * @param {array} attrs 节点属性数组
   * @returns 返回一个节点对象
   */
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

  /**
  * 根据 tag 和 attrs 创建 ast 语法树节点，并利用 stack 栈构建父子关系逐步形成树
  * @param {string} tag 标签名
  * @param {array} attrs 属性数组
  */
  //利用栈型解构来构造一棵树
  function start(tag, attrs) {
    // 解析到开始标签及其属性
    let node = createASTElement(tag, attrs) // 根据开始标签及其属性创建 ast 语法树节点
    if (!root) {//看一下是否是空树
      root = node//如果为空则当前是树的根节点
    }
    if (currentParent) {
      node.parent = currentParent // 指定当前节点的父节点
      currentParent.children.push(node) // 添加当前父亲的子节点
    }
    stack.push(node) // 节点入栈
    currentParent = node  // 当前父亲 currentParent 为栈中的最后一个节点
  }
  /**
 * 指定文本的父节点以及将文本放入父节点子数组中
 * @param {string} text 文本内容
 */
  function chars(text) {
    // 解析到文本内容
    text = text.replace(/\s/g, '')  // 将文本中的空白字符替换为空，替换后文本仍然有值才放入当前父亲的子数组中
    text && currentParent.children.push({ // 文本是栈中最后一个节点的子节点，直接放入 currentParent.children 中
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  /**
  * 重新设置 currentParent 当前父亲
  */
  function end(tag) {
    // 解析到结束标签
    stack.pop() // 解析到结束标签后，就把栈中的节点弹出
    currentParent = stack[stack.length - 1]  // 重新设置 currentParent 为栈中最后一个节点
  }

  /**
  * 截取 html 字符串
  * @param {number} length 截取长度
  */
  function advance(length) {
    html = html.substring(length)
  }

  /**
  * 解析开始标签及其属性
  * @returns 封装好的 match 对象，属性有 tagName 标签名和 attrs 属性列表。如果不是开始标签返回 false
  */
  function parseStartTag() {
    const start = html.match(startTagOpen);  // 尝试匹配开始标签
    if (start) { // 如果为开始标签
      const match = {
        tagName: start[1], //标签名
        attrs: [] // 标签属性
      }
      advance(start[0].length)  // 匹配到后从字符串中删除开始标签
      // 如果不是开始标签的结束就一直匹配下去
      let attr, end;
      while (!(end = html.match(startTagClose))) { // 如果开始标签没有结束，即还有属性存在
        attr = html.match(attribute)  // 匹配开始标签的属性
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true }) // 分组第三、四、五为属性 value 值；如果属性是 disabled 这样只有 key，那么值设为 true
        advance(attr[0].length)
      }
      if (end) {  // 匹配到开始标签的结束符号 > 了
        advance(end[0].length) // 从字符串中删除标签结束符
      }
      return match
    }
    return false
  }
  while (html) {  // 每次匹配到后都从模板字符串中删除，直至字符串为空
    /**
       * 如果为 0，说明是一个开始标签或结束标签，如 '<div>hello</div>' 或 '</div>'
       * 如果大于 0，说明是一段文本的结束位置，如 'hello</div>'
       */
    let textEnd = html.indexOf('<');
    if (textEnd == 0) { // html 字符串开头是一个标签
      const startTagMatch = parseStartTag() // 如果为开始标签，则解析标签和属性并返回封装的 match 对象
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag) // 尝试匹配结束标签
      if (endTagMatch) { // 本次循环匹配到的是结束标签
        advance(endTagMatch[0].length) // 从模板字符串中删除结束标签
        end(endTagMatch[1])
        continue
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd)//文本内容
      if (text) {
        chars(text)
        advance(text.length)  // 从模板字符串中删除这段文本
      }
    }
  }
  return root
}
