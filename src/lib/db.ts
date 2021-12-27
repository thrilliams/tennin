import { Schema, model, Types, connect, PopulateOptions } from 'mongoose';

const sideSchema = new Schema({
	code: String,
	name: String
});

export const Side = model('Side', sideSchema, 'sides');

const typeSchema = new Schema({
	code: String,
	is_subtype: Boolean,
	name: String,
	position: String,
	side: { type: Types.ObjectId, ref: 'Side' }
});

typeSchema.query.inflate = function () {
	return this.select('-_id')
		.populate({
			path: 'side',
			select: '-_id'
		})
		.lean();
};

export const Type = model('Type', typeSchema, 'types');

const factionSchema = new Schema({
	code: String,
	color: String,
	color_xterm: Number,
	is_mini: Boolean,
	name: String,
	side: { type: Types.ObjectId, ref: 'Side' }
});

factionSchema.query.inflate = function () {
	return this.select('-_id')
		.populate({
			path: 'side',
			select: '-_id'
		})
		.lean();
};

export const Faction = model('Faction', factionSchema, 'factions');

const cycleSchema = new Schema({
	code: String,
	name: String,
	position: String,
	rotated: Boolean,
	size: Number,

	packs: [{ type: Types.ObjectId, ref: 'Pack' }],
	cards: [{ type: Types.ObjectId, ref: 'Card' }]
});

cycleSchema.query.inflate = function (
	options: { packs?: boolean; cards?: boolean; lean?: boolean } = {}
) {
	let populateArgs = [];
	if (options.packs === undefined || options.packs)
		populateArgs.push({
			path: 'packs',
			select: '-_id -cycle -cards'
		});

	if (options.cards === undefined || options.cards)
		populateArgs.push({
			path: 'cards',
			select: '-_id',
			populate: [
				{
					path: 'side',
					select: '-_id'
				},
				{
					path: 'type',
					select: '-_id -side'
				},
				{
					path: 'faction',
					select: '-_id -side'
				},
				{
					path: 'pack',
					select: '-_id -cycle -cards'
				}
			]
		});

	let query = this.select(
		`-_id ${options.cards === undefined || options.cards ? '' : '-cards'} ${
			options.packs === undefined || options.packs ? '' : '-packs'
		}`
	).populate(populateArgs);
	if (options.lean === undefined || options.lean) query = query.lean();
	return query;
};

export const Cycle = model('Cycle', cycleSchema, 'cycles');

const packSchema = new Schema({
	code: String,
	date_release: Date,
	ffg_id: Number,
	name: String,
	position: String,
	size: Number,

	cycle: { type: Types.ObjectId, ref: 'Cycle' },
	cards: [{ type: Types.ObjectId, ref: 'Card' }]
});

packSchema.query.inflate = function (options: { cards?: boolean; lean?: boolean } = {}) {
	let populateArgs: PopulateOptions[] = [
		{
			path: 'cycle',
			select: '-_id -cards -packs'
		}
	];

	if (options.cards === undefined || options.cards)
		populateArgs.push({
			path: 'cards',
			select: '-_id -pack',
			populate: [
				{
					path: 'side',
					select: '-_id'
				},
				{
					path: 'type',
					select: '-_id -side'
				},
				{
					path: 'faction',
					select: '-_id -side'
				}
			]
		});

	let query = this.select(
		`-_id ${options.cards === undefined || options.cards ? '' : '-cards'}`
	).populate(populateArgs);
	if (options.lean === undefined || options.lean) query = query.lean();
	return query;
};

export const Pack = model('Pack', packSchema, 'packs');

const cardSchema = new Schema({
	code: String,
	deck_limit: Number,
	position: String,
	quantity: Number,
	title: String,
	uniqueness: Boolean,

	// side_code: string,
	// type_code: string,
	// faction_code: string,
	// pack_code: string,
	side: { type: Types.ObjectId, ref: 'Side' },
	type: { type: Types.ObjectId, ref: 'Type' },
	faction: { type: Types.ObjectId, ref: 'Faction' },
	pack: { type: Types.ObjectId, ref: 'Pack' },

	escaped_title: String,
	resolved_types: String,
	parsed_text: String,
	hidden: Boolean,
	rotate: Number,
	parts: [{ type: Types.ObjectId, ref: 'Card' }],

	advancement_cost: Number,
	agenda_points: Number,
	base_link: Number,
	cost: Number,
	faction_cost: Number,
	flavor: String,
	illustrator: String,
	influence_limit: Number,
	keywords: String,
	memory_cost: Number,
	minimum_deck_size: Number,
	strength: Number,
	stripped_text: String,
	stripped_title: String,
	text: String,
	trash_cost: Number
});

cardSchema.query.inflate = function (options: { pack?: boolean; lean?: boolean } = {}) {
	let populateArgs: PopulateOptions[] = [
		{
			path: 'side',
			select: '-_id'
		},
		{
			path: 'type',
			select: '-_id -side'
		},
		{
			path: 'faction',
			select: '-_id -side'
		},
		{
			path: 'parts',
			select: '-_id title pack position escaped_title',
			populate: {
				path: 'pack',
				select: '-_id code'
			}
		}
	];
	if (options.pack === undefined || options.pack)
		populateArgs.push({
			path: 'pack',
			select: '-_id -cycle -cards'
		});

	let query = this.select(
		`-_id ${options.pack === undefined || options.pack ? '' : '-pack'}`
	).populate(populateArgs);
	if (options.lean === undefined || options.lean) query = query.lean();
	return query;
};

export const Card = model('Card', cardSchema, 'cards');

connect('mongodb://localhost/tennin');
