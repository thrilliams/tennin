import { Cycle, Pack } from '$lib/db';

export async function get() {
	// @ts-expect-error
	let cycles = await Cycle.find().sort({ position: -1 }).inflate({ cards: false }).exec();

	return {
		body: cycles
	};
}
