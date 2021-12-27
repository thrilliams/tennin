import { Pack } from '$lib/db';

export async function get() {
	let packs = await Pack.find()
		.sort({ position: 1 })
		// @ts-expect-error
		.inflate({ cards: false, packs: false })
		.exec();

	return {
		body: packs
	};
}
