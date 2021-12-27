<script context="module" lang="ts">
	export async function load({ page, fetch }) {
		const { params } = page;

		const [cardRes, printingsRes, imageRes] = await Promise.all([
			fetch(`/api/cards/${params.pack}/${params.position}`),
			fetch(`/api/cards/${params.pack}/${params.position}/printings`),
			fetch('/api/images', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					images: [`${params.pack}/${params.position}.jpg`]
				})
			})
		]);

		if (cardRes.ok && printingsRes.ok && imageRes.ok) {
			const card = await cardRes.json();

			// direct to correctly named path
			if (params.name !== card.escaped_title) {
				return {
					status: 301,
					redirect: `/cards/${card.pack.code}/${card.position}/${card.escaped_title}`
				};
			}

			const image = await imageRes.json();
			const srcsets = image[0];

			let printings = await printingsRes.json();
			printings = printings.sort(
				(a, b) => new Date(b.pack.date_release).getTime() - new Date(a.pack.date_release).getTime()
			);

			console.log(printings);

			return {
				props: { card, srcsets, printings }
			};
		} else {
			if (!cardRes.ok)
				return {
					status: cardRes.status,
					error: new Error(`Could not load card data.`)
				};

			if (!printingsRes.ok)
				return {
					status: printingsRes.status,
					error: new Error(`Could not load card printings.`)
				};

			if (!imageRes.ok)
				return {
					status: imageRes.status,
					error: new Error(`Could not load image data.`)
				};
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { sineInOut } from 'svelte/easing';
	import CardImage from '$lib/cards/CardImage.svelte';
	import CardText from '$lib/cards/CardText.svelte';

	export let card, srcsets, printings;

	let rotate = 0;
	function doRotate() {
		rotate = rotate === 0 ? card.rotate : 0;
	}

	function doFlip() {
		let flip = card.parts.find((p) => p.position !== card.position);
		goto(`/cards/${flip.pack.code}/${flip.position}/${flip.escaped_title}`);
	}

	function flip(node, { duration = 200, mode = 'in', delay = 0, easing = sineInOut }) {
		return {
			duration,
			delay,
			easing: easing,
			css: (t, u) => {
				return `
				transform: rotateY(${mode === 'in' ? u * 90 : t * 90 - 90}deg);
				
				transform-style: preserve-3d;`;
			}
		};
	}
</script>

<svelte:head>
	<title>{card.title} - Tennin</title>
</svelte:head>

<div class="card">
	<div class="image-container">
		{#if card.parts !== null}
			{#key card}
				<div class="image" in:flip={{ mode: 'in', delay: 200 }} out:flip|local={{ mode: 'out' }}>
					<CardImage lazy={false} {card} {srcsets} {rotate} />
				</div>
			{/key}
		{:else}
			<div class="image">
				<CardImage lazy={false} {card} {srcsets} {rotate} />
			</div>
		{/if}
	</div>
	<div class="text">
		<CardText {card} />
	</div>
	<div class="printings">
		<div class="current">
			<a href={`/packs/${card.pack.code}`} sveltekit:prefetch>
				{card.pack.name} ({card.pack.code.toUpperCase()}#{card.position})
			</a>
		</div>
		<div class="list">
			<span>Printings</span>
			{#each printings as printing}
				{#if printing.position === card.position && printing.pack.code === card.pack.code}
					<span class="active">
						{printing.pack.name}
					</span>
				{:else}
					<a
						href={`/cards/${printing.pack.code}/${printing.position}/${printing.escaped_title}`}
						sveltekit:prefetch
						sveltekit:noscroll
					>
						{printing.pack.name}
					</a>
				{/if}
			{/each}
		</div>
		{#if card.parts !== null}
			<div class="list">
				<span>Faces and Parts</span>
				{#each card.parts as part}
					{#if part.position === card.position}
						<span class="active">
							{part.title}
						</span>
					{:else}
						<a
							href={`/cards/${part.pack.code}/${part.position}/${part.escaped_title}`}
							sveltekit:prefetch
							sveltekit:noscroll
						>
							{part.title}
						</a>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="controls">
		{#if card.rotate !== null}
			<button class="button" on:click={doRotate}>Rotate</button>
		{/if}

		{#if card.part_layout === 'flip'}
			<button class="button" on:click={doFlip}>Flip</button>
		{/if}
	</div>

	<div class="toolbox">
		Toolbox
		<a
			class="button"
			target="_blank"
			href={`https://knowthemeta.com/card/${card.code.match(/\d+/)[0]}/${
				card.parts !== null ? card.parts[0].escaped_title : card.escaped_title
			}`}
		>
			View on Know the Meta
		</a>
		<a
			class="button"
			target="_blank"
			href={`https://netrunnerdb.com/en/card/${card.code.match(/\d+/)[0]}`}
		>
			View on NetrunnerDB
		</a>
	</div>

	<div class="data">
		Data
		<a target="_blank" href={`/api/cards/${card.pack.code}/${card.position}`} class="button">
			Copy-pasteable JSON
		</a>
	</div>

	<div class="images">
		Images
		<a class="button" href={srcsets.single} download={`${card.escaped_title}.jpg`}>
			Download JPG image
		</a>
		<a class="button" href={srcsets.full} download={`${card.escaped_title}.png`}>
			Download full-resolution PNG image
		</a>
	</div>
</div>

<style lang="scss">
	.card {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr min-content min-content;
		gap: 15px;

		.image-container {
			grid-column: 1;
			grid-row: 1;
			perspective: 1000px;
			z-index: 1;

			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;

			.image {
				grid-column: 1;
				grid-row: 1;
			}
		}

		.text {
			display: grid;
			grid-column: 2;
			grid-row: 1;
		}

		.printings {
			grid-column: 3;
			grid-row: 1;

			display: flex;
			flex-direction: column;
			gap: 15px;

			a {
				text-decoration: none;
				color: #000;
			}

			> div {
				border: 1px solid;
				border-radius: 5px;
				// padding: 10px;
				display: flex;
				flex-direction: column;

				.active,
				:hover {
					background-color: rgba(0, 0, 0, 0.05);
				}

				:first-child {
					border-radius: 5px 5px 0 0;
				}

				> * {
					border-bottom: 1px solid;
					padding: 10px;
				}

				:last-child {
					border-radius: 0 0 5px 5px;
					border-bottom: none;
				}
			}

			.list {
				:first-child {
					background-color: white;
				}
			}
		}

		.controls {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 10px;

			grid-column: 1;
			grid-row: 2;
		}

		.toolbox {
			grid-column: 1;
		}

		.data {
			grid-column: 2;
		}

		.images {
			grid-column: 3;
		}

		.toolbox,
		.data,
		.images {
			grid-row: 3;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}
	}

	.button {
		background-color: #fff;
		border: 1px solid black;
		border-radius: 5px;
		padding: 5px;
		color: #000;
		cursor: pointer;
		text-decoration: none;

		&:hover {
			background-color: rgba(0, 0, 0, 0.05);
		}
	}
</style>
