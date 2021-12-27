<script lang="ts" context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch }) {
		const cardRes = await fetch(`/api/search?` + page.query);

		if (cardRes.ok) {
			const cards = await cardRes.json();

			const imageRes = await fetch('/api/images', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					images: cards.map((card) => `${card.pack.code}/${card.position}.jpg`)
				})
			});

			const srcsetGroups = await imageRes.json();

			return {
				props: { cards, srcsetGroups }
			};
		} else {
			return {
				status: cardRes.status,
				error: new Error(`Could not load card data.`)
			};
		}
	}
</script>

<script lang="ts">
	import CardGallery from '$lib/cards/CardGallery.svelte';

	export let cards, srcsetGroups;
</script>

<CardGallery {cards} {srcsetGroups} />
