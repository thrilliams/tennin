const IMAGE_DIR = '/src/static/images/';

import path from 'path';
const __dirname = path.resolve();

export async function post(request) {
	try {
		const { images } = request.body;

		const srcsetPromises = images.map(async (image) => {
			const source = path.join(__dirname, IMAGE_DIR, image);
			return {
				webp: (await import(`${source}?w=580;290;145&format=webp&srcset`)).default,
				jpeg: (await import(`${source}?w=580;290;145&srcset`)).default,
				single: (await import(`${source}?w=290`)).default,
				thumbnail: (await import(`${source}?w=87`)).default,
				full: (await import(`${source}?format=png`)).default
			};
		});

		const srcsetGroups = await Promise.all(srcsetPromises);

		return {
			body: srcsetGroups
		};
	} catch (err) {
		return {
			status: 500,
			error: 'Error retreiving data'
		};
	}
}
