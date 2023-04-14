const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyVitePlugin);

  eleventyConfig.addPassthroughCopy('public');
	eleventyConfig.addPassthroughCopy('src/css');
	eleventyConfig.addPassthroughCopy('src/js');

  return {
    dir: {
      input: 'src',
    },
  };
};
