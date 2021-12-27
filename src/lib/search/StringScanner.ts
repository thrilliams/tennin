export class StringScanner {
	#pointer: number;
	#source: string;
	#lastCapture: RegExpMatchArray;

	constructor(source: string) {
		this.#pointer = 0;
		this.#source = source;
	}

	pointer() {
		return this.#pointer;
	}

	bol() {
		return this.#pointer === 0;
	}

	eos() {
		return this.#pointer >= this.#source.length;
	}

	scan(pattern: RegExp) {
		let match = this.#source.slice(this.#pointer).match(pattern);
		if (match && match.index === 0) {
			this.#pointer += match[0].length;
			this.#lastCapture = match;
			return match;
		}
		return null;
	}

	captures() {
		return this.#lastCapture;
	}
}
