import { Faction } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	// @ts-expect-error
	let faction = await Faction.findOne({ code: params.code }).inflate().exec();

	return {
		body: faction
	};
}
