import { Pack } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	// @ts-expect-error
	let pack = await Pack.findOne({ code: params.code }).inflate({ cards: false }).exec();

	return {
		body: pack
	};
}
