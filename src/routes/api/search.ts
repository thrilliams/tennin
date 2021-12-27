import { search } from '$lib/search/search';

export async function get({ query }) {
	let cards = await search(query)
		.select('-_id')
		// @ts-ignore
		.inflate()
		.exec();

	cards = cards.filter((card, i) => cards.findIndex((c) => c.title === card.title) === i);

	return {
		body: cards
	};
}
