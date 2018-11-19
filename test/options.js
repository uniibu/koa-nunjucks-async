
const nunjucksOptions = {
  filters: {
    syncAdd: (v1, v2) => v1 + v2,
    asyncAdd: async (v1,v2) => {
      return await new Promise(resolve => {
        setTimeout(() => {
          resolve(v1 + v2);
        }, 100);
      });
    }
  },
  globals: {
    title: 'My Page'
  },
  ext: '.html'
};
module.exports = nunjucksOptions;