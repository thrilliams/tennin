<script lang="ts" context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch }) {
		const [cardRes, cycleRes] = await Promise.all([
			fetch(`/api/cycles/${page.params.code}/cards`),
			fetch(`/api/cycles/${page.params.code}`)
		]);

		if (cardRes.ok && cycleRes.ok) {
			const cards = await cardRes.json();
			const cycle = await cycleRes.json();

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
				props: { cycle, cards, srcsetGroups }
			};
		} else {
			if (!cardRes.ok)
				return {
					status: cardRes.status,
					error: new Error(`Could not load card data.`)
				};
			else
				return {
					status: cycleRes.status,
					error: new Error(`Could not load cycle data.`)
				};
		}
	}
</script>

<script lang="ts">
	import CardGallery from '$lib/cards/CardGallery.svelte';

	export let cycle, cards, srcsetGroups;
</script>

<svelte:head>
	<title>{cycle.name} Cycle - Tennin</title>
</svelte:head>

<CardGallery {cards} {srcsetGroups} />
