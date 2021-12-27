import { Cycle, Card } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	let cycle = await Cycle.findOne({ code: params.code }).exec();
	let cards = Card.find({ pack: { $in: cycle.packs } });
	if (cycle.code === 'terminal-directive') {
		cards = cards.sort({ pack: 1, position: 1 });
	} else {
		cards = cards.sort({ position: 1 });
	}
	// @ts-expect-error
	cards = await cards.inflate().exec();

	// @ts-expect-error
	cards = cards.filter((card) => card.pack.code !== 'urbp');

	return {
		body: cards
	};
}
