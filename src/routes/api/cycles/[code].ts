import { Cycle } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	// @ts-expect-error
	let cycle = await Cycle.findOne({ code: params.code }).inflate({ cards: false }).exec();

	return {
		body: cycle
	};
}
