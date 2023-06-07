(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
      //这里重写了数组的方法
      console.log("\u6211\u8C03\u7528\u4E86".concat(method, "\u65B9\u6CD5"));
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
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
        console.log('打印');
        console.log(inserted);
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
        console.log('用户取值');
        console.log(key);
        return value;
      },
      set: function set(newValue) {
        //修改的时候会执行set
        if (newValue === value) return;
        console.log('用户设置值');
        console.log(key);
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

  function compileToFunction(template) {
    console.log(template);
    //1.就是将template转化成ast语法树
    //2.生成render方法(render方法执行后的返回结果就是虚拟DOM)
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
      console.log(el);
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
          opts.render = render;
        }
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  //通过方法传递 Vue，然后在方法中添加原型方法
  initMixin(Vue); // 传递 Vue 的同时扩展了 _init 方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
