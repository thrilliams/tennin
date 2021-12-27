import { Pack, Card } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	let pack = await Pack.findOne({ code: params.code }).exec();
	// @ts-expect-error
	let cards = await Card.find({ pack: pack._id }).inflate().exec();

	return {
		body: cards
	};
}
