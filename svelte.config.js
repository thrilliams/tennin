import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { imagetools } from 'vite-imagetools';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		sass: preprocess.sass()
	}),

	kit: {
		adapter: adapter(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		files: {
			assets: 'src/static'
		},

		vite: {
			resolve: {
				alias: {
					$static: path.resolve('src/static')
				}
			},
			plugins: [imagetools({ force: true })]
		}
	}
};

export default config;
