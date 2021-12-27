import { Card } from '$lib/db';

export async function get() {
	// @ts-expect-error
	let cards = await Card.find().sort({ position: 1 }).inflate().exec();

	return {
		body: cards
	};
}
