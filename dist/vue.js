(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
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
