/** @license
 * Copyright (c) 2018-present John Paul Sayo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const nunjucks = require('nunjucks');
const assert = require('assert');
const { promisify } = require('util');

/**
 * Default nunjucks options
 *
 */
const defaults = {
  opts: {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
    watch: false,
    noCache: false
  },
  filters: {},
  globals: {},
  extensions: {},
  ext: '.html'
};

/**
 * @function      isAsync
 * @param  fn The function to check if is async
 *
 */
const isAsync = (fn) => {
  return fn && fn.constructor && ['GeneratorFunction', 'AsyncFunction'].includes(fn.constructor.name);
};
/**
 * Wrap an async function
 *
 * @function      asyncWrapper
 * @param  filter  User's custom filter function
 */
const asyncWrapper = (filter) => {
  return (...args) => {
    const callback = args.pop();
    Promise.resolve(filter(...args)).then(
      val => callback(null, val),
      err => callback(err, null)
    );
  };
};

/**
 * Destructure an object and apply the corresponding fn
 *
 * @function      destruct
 * @param  obj The KoaNunjucks settings that includes filters,globals and extensions
 * @param  fn The function or value to call
 * @param  check To check if a function is async
 *
 */
const destruct = (obj, fn, check) => {
  for (const name of Object.keys(obj)) {
    if (check && isAsync(obj[name])) {
      fn(name, asyncWrapper(obj[name]), true);
    }else{
      fn(name, obj[name]);
    }
  }
};

/**
 * Adds a custom filter, globals and extension
 *
 * @function      addCustom
 * @param  env  The Nunjucks Environment
 * @param  obj The KoaNunjucks settings that includes filters,globals and extensions
 * @reference https://mozilla.github.io/nunjucks/api.html
 */
const addCustom = (env, obj) => {

  destruct(obj.filters, (name, fn, o = false) => {
    env.addFilter(name,fn, o);
  },true);
  destruct(obj.globals, (name, fn) => {
    env.addGlobal(name, fn);
  });
  destruct(obj.extensions, (name, fn) => {
    env.addExtension(name, fn);
  });
  return env;
};
/**
 * Main KoaNunjucks Middleware function
 *
 *
 * @function      KoaNunjucks
 * @param  String   path     The path to the templates, normally this is 'views'
 * @param  Object  options  The nunjucks options
 * @reference https://mozilla.github.io/nunjucks/api.html
 */
const KoaNunjucks = (path, options = {}) => {
  assert(typeof path === 'string', 'Invalid/Missing path');
  options = Object.assign({}, defaults, options);
  let env = nunjucks.configure(path, options.opts);
  env.render = promisify(env.render);
  env.renderString = promisify(env.renderString);
  addCustom(env, options);
  return async (ctx, next) => {
    ctx.render = async (view, context) => {
      context = Object.assign({}, ctx.state, context);
      view += options.ext;
      const body = await env.render(view, context);
      ctx.type = ctx.type || 'text/html';
      ctx.body = body;
      return;
    };
    ctx.renderString = async (string, context) => {
      assert(typeof string === 'string', 'Invalid string');
      context = Object.assign({}, ctx.state, context);
      return await env.renderString(string, context);
    };
    await next();
  };
};

module.exports = KoaNunjucks;