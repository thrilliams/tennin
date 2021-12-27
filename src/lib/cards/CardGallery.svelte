<script lang="ts">
	import CardImage from './CardImage.svelte';
	import CardText from './CardText.svelte';

	export let mode: 'image' | 'text' = 'image';
	export let ignoreHidden = false;

	export let cards, srcsetGroups;

	let groups = [];

	for (let i = 0; i < cards.length; i++) {
		groups.push([cards[i], srcsetGroups[i]]);
	}
</script>

<div class="gallery">
	{#each groups as [card, srcsets]}
		{#if ignoreHidden || !card.hidden}
			<a href={`/cards/${card.pack.code}/${card.position}/${card.escaped_title}`}>
				{#if mode === 'image'}
					<CardImage lazy={true} {card} {srcsets} />
				{:else}
					<CardText {card} />
				{/if}
			</a>
		{/if}
	{/each}
</div>

<style lang="scss">
	.gallery {
		display: grid;
		gap: 15px;

		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-auto-rows: 1fr;

		a {
			text-decoration: none;
			color: inherit;
			display: grid;
		}
	}
</style>
