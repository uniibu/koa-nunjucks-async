'use strict';
const nunjucks = require('nunjucks');
const assert = require('assert');
const util = require('util');
/**
 * Loop Helper function
 *
 */
function whileLoop(obj, fn) {
    var keys = Object.keys(obj);
    var i = keys.length;
    while (i--) {
        fn(keys[i], obj[keys[i]]);
    }
}
/**
 * Adds a custom filter, globals and extension
 *
 * @param  env  The Nunjucks Environment
 * @param  obj The KoaNunjucks settings that includes filters,globals and extensions
 * @reference https://mozilla.github.io/nunjucks/api.html
 */
const addCustom = async (env, obj) => {
    try {
        const addC = Object.keys(obj).map(i => {
                if (i == 'filters') {
            whileLoop(obj.filters, (name, fn) => {
                env.addFilter(name, fn);
        });
        } else if (i == 'globals') {
            whileLoop(obj.globals, (name, fn) => {
                env.addGlobal(name, fn);
        });
        } else if (i == 'extensions') {
            whileLoop(obj.extensions, (name, fn) => {
                env.addExtension(name, fn);
        });
        }
    });
        await Promise.all(addC);
    } catch (e) {
        console.warn('Nunjucks Error', e);
    }
};
/**
 * Main KoaNunjucks Middleware function
 *
 * @function      KoaNunjucks
 * @param  String   path     The path to the templates, normally this is 'views'
 * @param  Object  options  The nunjucks options
 * @reference https://mozilla.github.io/nunjucks/api.html
 */
const KoaNunjucks = (path, options = {}) => {
    assert(typeof path === 'string');
    let settings = {
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
    settings = Object.assign(settings, options);
    const env = nunjucks.configure(path, settings.opts);
    env.render = util.promisify(env.render);
    env.renderString = util.promisify(env.renderString);
    addCustom(env, settings);
    return async (ctx, next) => {
        ctx.render = async (view, context) => {
            try {
                context = Object.assign({}, ctx.state, context);
                view += settings.ext;
                const body = await env.render(view, context);
                ctx.type = ctx.type || 'text/html';
                ctx.body = body;
                return;
            } catch (e) {
                console.warn('Nunjucks Render Error:', e);
            }
        };
        ctx.renderString = async (string, context) => {
            try {
                assert(typeof string === 'string');
                context = Object.assign({}, ctx.state, context);
                return await env.renderString(string, context);
            } catch (e) {
                console.warn('Nunjucks RenderString Error:', e);
            }
        };
        await next();
    };
};
module.exports = KoaNunjucks;