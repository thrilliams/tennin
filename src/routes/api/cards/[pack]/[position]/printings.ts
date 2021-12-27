import { Pack, Card } from '$lib/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	let pack = await Pack.findOne({ code: params.pack }).exec();
	let card = await Card.findOne({ pack: pack._id, position: params.position }).exec();

	let printings = await Card.find({ title: card.title, pack: { $ne: pack._id } })
		.select('-_id pack position escaped_title')
		.populate('pack', '-_id code name date_release')
		.lean()
		.exec();

	printings = [
		...printings,
		await Card.findOne({ pack: pack._id, position: params.position })
			.select('-_id pack position escaped_title')
			.populate('pack', '-_id code name date_release')
			.lean()
			.exec()
	];

	return {
		body: printings
	};
}
