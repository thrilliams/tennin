import { Pack, Card } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	let pack = await Pack.findOne({ code: params.pack }).exec();
	let card = await Card.findOne({ pack: pack._id, position: params.position })
		// @ts-expect-error
		.inflate()
		.exec();

	return {
		body: card
	};
}
