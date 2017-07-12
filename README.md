# koa-nunjucks-async
A Nunjucks Renderer Middleware for KoaJs v2+ that uses native async/await of Nodejs

------------
[![Node version](https://img.shields.io/badge/Node-8.0.0-blue.svg)](http://nodejs.org/download/)
[![Koajs deps](https://img.shields.io/badge/Koajs-2.3.0-brightgreen.svg)](https://github.com/koajs/koa)


A Koa Middleware that allows you to render nunjucks templates. [![Nunjucks](https://img.shields.io/badge/Nunjucks-3.0.1-green.svg)](https://mozilla.github.io/nunjucks/)

Why Build this if you can use other repositories that also supports Koa@2 ?

* Easy to use, Faster since no other dependencies are involved.
* Uses native Async/Await of Nodejs, No other dependencies other than Nunjucks.
* Uses native util.promisify of Nodejs.
* Does not use koa-convert middleware.
* Directly uses nunjucks which means all Nunjucks 'options' are available.

# Other features

* ctx.state are also exposed automatically to all templates. However, ctx.state gets overwritten (just for that instance) in case the same name is passed via context.
* This middlware also exposes nunjucks.renderString which can be called using `ctx.renderString('<p>{msg}</p>',{msg:'hello'})` it is the same as render, but renders a raw string instead of loading a template.

Install
=======

    npm install --save koa-nunjucks-async

Initialization
=======

### Example:

    const Koa = require('koa');
    const nunjucks = require('koa-nunjucks-async');
    const app = new Koa();

    const nunjucksOptions = {
        opts: {
            noCache: false,
            throwOnUndefined: false
        },
        filters: {
            json: x => JSON.stringify(x, null, 2),
            ucfirst: e => typeof e === 'string' && e.toLowerCase() && e[0].toUpperCase() + e.slice(1);
        },
        globals: { title: 'My Page' },
        ext: '.html'
    };
    // Load other middlewares...
    // Load nunjucks last before routes
    app.use(nunjucks('views', nunjucksOptions);

    // Load your routes...

Note: The nunjucksOptions.opts object is passed directly to `nunjucks` module.

### Available Options(optional) and their Default values.

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

Check https://mozilla.github.io/nunjucks/api.html#configure for each of the opts description.

Usage
=======

### Syntax

    await ctx.render('name_of_template_file',context);

### You can use it with Koa's native routing:

      const koa = require('koa');
      const app = new Koa();

      app.use(async ctx => {
        await ctx.render('template', {
             message: 'Hello World!'
           });
      });

### Or via other router middleware such as Koa-router:

    const Router = require('koa-router');
    const router = new Router();

    router.get('/', async ctx => {
       await ctx.render('template', {
             message: 'Hello World!'
           });
    });

### Exposing variables other than context(ctx) by using ctx.state:

      const koa = require('koa');
      const app = new Koa();

      app.use(async (ctx,next) => {
          ctx.state.title = "My Page";
          await next();
      })

      // the variable 'title' is now exposed to all templates unless overwritten by context.
      // So using {{ title }} will render "My Page".
      app.use(async ctx => {
        await ctx.render('template', {
             message: 'Hello World!'
           });
      });

License
=======
This project is licensed under the MIT license. See the LICENSE file for more info.