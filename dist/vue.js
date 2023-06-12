(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 我们希望重写数组中的部分方法
  var oldArrayProto = Array.prototype; //获取数组的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [
  //找到所有的变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  //concat slice 都不会改变原数组

  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //这里重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法，函数的劫持，切片编程

      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.splice(2);
          break;
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      //给数据加了一个标识，如果数据上有__ob__，则说明这个属性被观测过
      //Object.defineProperty只能劫持已经存在的属性，后增的，或者删除的不知道
      if (Array.isArray(data)) {
        //这里我们可以重写数组中的方法，7个变异方法,是可以修改数组本身的
        data.__proto__ = newArrayProto;
        this.observeArray(data); //如果数组中放的是对象，是可以监控到对象的变化
      } else {
        this.walk(data); // 对 data 进行遍历，劫持属性
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  function defineReactive(target, key, value) {
    //闭包
    observe(value); //对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候会执行get
        return value;
      },
      set: function set(newValue) {
        //修改的时候会执行set
        if (newValue === value) return;
        value = newValue;
        observe(newValue);
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }
    // 如果一个对象被劫持过了，就不需要再被劫持
    // 而要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断
    // 这里先不加这段逻辑，后面章节会加
    // if (data.__ob__ instanceof Observe) {
    //   return data.__ob__
    // }
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; // 这个data就是 new Vue时传入的data，可能是函数也可能是对象
    data = typeof data === 'function' ? data.call(vm) : data; // 如果是函数则执行函数拿到返回值

    vm._data = data;
    observe(data);

    //将vm._data 用vm来代理就可以了
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // aa:aa 命名空间字符串
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  function parseHTML(html) {
    var ELEMETN_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素的
    var currentParent; //指向的是栈中的最后一个
    var root;

    //最终需要转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMETN_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    //利用栈型解构来构造一棵树
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); //创造一个ast节点
      if (!root) {
        //看一下是否是空树
        root = node; //如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node; //currentParent为栈中的最后一个
    }

    function chars(text) {
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop(); //弹出最后一个
      currentParent = stack[stack.length - 1];
    }
    function advance(length) {
      html = html.substring(length);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length);
        // 如果不是开始标签的结束就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose))) {
          attr = html.match(attribute);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          advance(attr[0].length);
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false;
    }
    while (html) {
      //textEnd如果为0说明是一个开始标签或者结束标签
      var textEnd = html.indexOf('<');
      if (textEnd == 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容
        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }
    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }
  function compileToFunction(template) {
    //1.就是将template转化成ast语法树
    var ast = parseHTML(template);
    //2.生成render方法(render方法执行后的返回结果就是虚拟DOM)
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  //ast一样吗?ast做的是语法层面的转化，他描述的是语法本身(可以描述js css html)
  //我们的虚拟dom是描述的dom元素，可以增加一些自定义属性(描述dom的)
  function vnode(vm, tag, key, props, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      props: props,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      props = vnode.props,
      children = vnode.children,
      text = vnode.text;
    var data = props;
    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      var elm = oldVNode; //获取真实元素
      var parentElm = elm.parentNode; //拿到父元素
      console.log(vnode);
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var el = this.$el;
      this.$el = patch(el, vnode);
    };
    Vue.prototype._render = function () {
      return this.$options.render.call(this); //通过ast语法转义后生成的render
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
  }

  //vue核心流程  1.创造了响应式数据 2.模板转换成ast语法树
  //3.将ast语法树转换了render函数 4.后续每次数据更新可以只执行render函数 无需再次执行ast转化的流程

  //render函数会产生虚拟节点(使用响应式数据)
  //根据生成的虚拟节点创造真实的DOM
  function mountComponent(vm, el) {
    vm.$el = el;
    //调用render方法产生虚拟节点
    vm._update(vm._render());

    //根据虚拟DOM产生真实DOM

    //插入到el元素中
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var opts = vm.$options;
      if (!opts.render) {
        // 如果用户没有自己写 render 函数
        var template;
        if (el) {
          if (opts.template) {
            template = opts.template; //这里不考虑兼容性细节，直接用 outerHTML 获取整个元素字符串
          } else {
            template = el.outerHTML;
          }
        }
        if (template) {
          // 这里就拿到了用户传入的 template 或是 el 转化的 template 字符串
          // 在这里对模板进行编译
          var render = compileToFunction(template);
          console.log(render);
          opts.render = render;
        }
      }
      mountComponent(vm, el); //组件的挂在
    };
  }

  function Vue(options) {
    this._init(options);
  }

  //通过方法传递 Vue，然后在方法中添加原型方法
  initMixin(Vue); // 传递 Vue 的同时扩展了 _init 方法
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
