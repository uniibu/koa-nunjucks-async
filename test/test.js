'use strict';

const Koa = require('koa');
const request = require('supertest');
const nunjucks = require('../src');
const nunjucksOptions = require('./options')

describe('state', () => {
  it('should work with ctx.state', async () => {
    const app = new Koa();
    app.use(async (ctx, next) => {
      ctx.state.title = "State Title";
      await next();
    })
    app.use(nunjucks('test/views', nunjucksOptions))
    app.use(async ctx => {
      await ctx.render('title');
    });

    await request(app.callback())
      .get('/')
      .expect(200)
      .expect('State Title');
  });
  it('should work with locally passed objects', async () => {
    const app = new Koa();
    app.use(nunjucks('test/views', nunjucksOptions))
    app.use(async ctx => {
      await ctx.render('title', {
        title: 'State Title'
      });
    });

    await request(app.callback())
      .get('/')
      .expect(200)
      .expect('State Title');
  });
})
describe('filters', () => {
  it('should work with syncronous filters', async () => {
    const app = new Koa();
    app.use(nunjucks('test/views', nunjucksOptions));
    app.use(async ctx => {
      await ctx.render('sync-filter');
    });
    await request(app.callback())
      .get('/')
      .expect(200)
      .expect('11');
  });
  it('should work with asyncronous filters', async () => {
    const app = new Koa();
    app.use(nunjucks('test/views', nunjucksOptions));
    app.use(async ctx => {
      await ctx.render('async-filter');
    });
    await request(app.callback())
      .get('/')
      .expect(200)
      .expect('11');
  });
})
describe('globals', () => {
    it('should recognize globals', async () => {
      const app = new Koa();
      app.use(nunjucks('test/views', nunjucksOptions));
      app.use(async ctx => {
        await ctx.render('title');
      });
      await request(app.callback())
        .get('/')
        .expect(200)
        .expect('My Page');
    });
  })