import type { Model, Query } from 'mongoose';
import { Card } from '../db';
import { StringScanner } from './StringScanner';

type Token = {
	type: string;
	mode?: string;
	value: string | RegExp | [string, string | number] | Token[];
};

export function search(
	query: URLSearchParams,
	querylike: Model<any, any, any, any> | Query<any, any, any, any> = Card
) {
	let { tokens, errors } = tokenize(query.get('q'));
	console.log({ tokens, errors: errors.map((e) => e.message) });
	return querylike.find({ title: { $regex: /ger/i } }).sort({ title: 1 });
}

function tokenize(query: string) {
	let tokens: Token[] = [];
	let errors: Error[] = [];
	let s = new StringScanner(query.toLowerCase());
	while (!s.eos()) {
		if (s.scan(/[\s,]+/i)) {
			// pass
		} else if (s.scan(/and\b/i)) {
			// and is default, skip it
		} else if (s.scan(/or\b/i)) tokens.push({ type: 'operator', value: 'or' });
		else if (s.scan(/-|not\b/i)) tokens.push({ type: 'operator', value: 'not' });
		else if (s.scan(/\(/i)) tokens.push({ type: 'operator', value: 'open' });
		else if (s.scan(/\)/i)) tokens.push({ type: 'operator', value: 'close' });
		else if (s.scan(/(o|x|text|ft|flavor|illustrator|n|name)[:=]\/((?:[^\\/]|\\.)*)\//i)) {
			let match = s.captures();

			// Add additional fields here?
			let map: { [key: string]: string } = {
				o: 'stripped_text',
				x: 'stripped_text',
				text: 'stripped_text',
				ft: 'flavor',
				flavor: 'flavor',
				// i: 'illustrator',
				illustrator: 'illustrator',
				n: 'stripped_title',
				name: 'stripped_title'
			};

			if (match[1] in map) {
				try {
					tokens.push({
						type: 'regex',
						mode: map[match[1]],
						value: new RegExp(match[2], 'i')
					});
				} catch (e) {
					errors.push(e.message);
				}
			} else {
				errors.push(Error(`Unknown field: ${match[1]}`));
			}
		} else if (s.scan(/(?:t|type)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({ type: 'type', value: s.captures()[1] || s.captures()[2] });
		else if (s.scan(/(?:ft|flavor)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({ type: 'flavor', value: s.captures()[1] || s.captures()[2] });
		else if (s.scan(/(?:o|x|text)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({ type: 'text', value: s.captures()[1] || s.captures()[2] });
		else if (s.scan(/(?:i|illustrator)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({ type: 'illustrator', value: s.captures()[1] || s.captures()[2] });
		else if (s.scan(/(banned|restricted|pointed|legal)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({
				type: 'legality',
				mode: s.captures()[1],
				value: s.captures()[2] || s.captures()[3]
			});
		else if (s.scan(/(?:fr|format)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({
				type: 'legality',
				mode: 'legal',
				value: s.captures()[1] || s.captures()[2]
			});
		else if (s.scan(/(?:name|n)(>=|>|<=|<|=|:)(?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({
				type: 'title',
				mode: s.captures()[1],
				value: s.captures()[2] || s.captures()[3]
			});
		else if (s.scan(/(e|set|p|pack|cycle)[:=](?:"((?:\\"|[^"])*)"|(\w+))/i)) {
			let match = s.captures();

			let map = {
				e: 'either',
				set: 'either',
				p: 'pack',
				pack: 'pack',
				// c: 'cycle',
				cycle: 'cycle'
			};

			if (match[1] in map) {
				tokens.push({
					type: 'set',
					mode: map[match[1]],
					value: match[2] || match[3]
				});
			} else {
				errors.push(Error(`Unknown field: ${match[1]}`));
			}
		} else if (s.scan(/(?:f|faction)(>=|>|<=|<|=|:)(?:"((?:\\"|[^"])*)"|(\w+))/i))
			tokens.push({
				type: 'faction',
				mode: s.captures()[1],
				value: s.captures()[2] || s.captures()[3]
			});
		else if (s.scan(/(?:s|side)[:=](c|corp|r|runner)/i)) {
			let map = {
				c: 'corp',
				corp: 'corp',
				r: 'runner',
				runner: 'runner'
			};
			tokens.push({
				type: 'side',
				value: map[s.captures()[1]]
			});
		} else if (
			s.scan(
				/(cost|c|agendapoints|points|a|influence|i|trashcost|trash|tr|decksize|size|link|l|strength|s|prints|position)(>=|>|<=|<|=|:)(cost\b|c\b|agendapoints\b|points\b|a\b|influence\b|i\b|trashcost\b|trash\b|tr\b|decksize\b|size\b|link\b|l\b|strength\b|s\b|prints\b|position\b|(?:-?(\d*\.)?\d+)\b|∞\b|"(?:-?(\d*\.)?\d+)"\b)/i
			)
		) {
			let match = s.captures();

			let map = {
				cost: 'cost',
				c: 'cost',
				agendapoints: 'agendapoints',
				points: 'agendapoints',
				a: 'agendapoints',
				influence: 'influence',
				i: 'influence',
				trashcost: 'trashcost',
				trash: 'trashcost',
				tr: 'trashcost',
				decksize: 'decksize',
				size: 'decksize',
				link: 'link',
				l: 'link',
				strength: 'strength',
				s: 'strength'
			};

			if (match[1] in map) {
				let fieldA = map[match[1]];
				let fieldB: string | number;

				if (match[3] in map) {
					fieldB = map[match[3]];
				} else {
					fieldB = parseFloat(match[3]);
					if (isNaN(fieldB)) {
						if (match[3] === '∞') {
							fieldB = Infinity;
						} else {
							errors.push(Error(`Unknown field: ${match[3]}`));
							continue;
						}
					}
				}

				tokens.push({ type: 'comparison', mode: match[2], value: [fieldA, fieldB] });
			} else {
				errors.push(Error(`Unknown field: ${match[1]}`));
			}
		} else if (s.scan(/!"((?:\\"|[^"])*)"/i))
			tokens.push({ type: 'title', mode: '=', value: s.captures()[1] });
		else if (s.scan(/"((?:\\"|[^"])*)"/i))
			tokens.push({ type: 'title', mode: ':', value: s.captures()[1] });
		else if (s.scan(/([^-!<>=:"\s&\/()][^<>=:"\s&\/()]*)+(?=$|[\s&\/()])/i))
			tokens.push({ type: 'title', mode: ':', value: s.captures()[0] });
		else {
			s.scan(/(\S+)/i);
			errors.push(Error(`Unrecognized token: ${s.captures()[1]}`));
		}
	}

	let resolved = resolveBrackets(tokens);
	errors = errors.concat(resolved.errors);
	tokens = resolved.stack;

	return { tokens, errors };
}

function resolveBrackets(tokens: Token[]) {
	let stack: Token[] = [];
	let errors: Error[] = [];

	for (let token of tokens) {
		if (token.value === 'close') {
			let value: Token[] = [];
			let open: Token;
			do {
				open = stack.pop();
				if (open === undefined) {
					errors.push(Error('Unmatched closing bracket'));
					break;
				}
				value.push(open);
			} while (open.value !== 'open');

			value = value.reverse().slice(1);

			let resolved = resolveBrackets(value);
			errors = errors.concat(resolved.errors);

			stack.push({ type: 'group', value: resolved.stack });
		} else {
			stack.push(token);
		}
	}

	if (stack.find((token) => token.value === 'open') !== undefined) {
		errors.push(Error('Unmatched opening bracket'));
	}

	return { stack, errors };
}
