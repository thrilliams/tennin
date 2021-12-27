<script lang="ts" context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ page, fetch }) {
		const [cardRes, packRes] = await Promise.all([
			fetch(`/api/packs/${page.params.code}/cards`),
			fetch(`/api/packs/${page.params.code}`)
		]);

		if (cardRes.ok && packRes.ok) {
			const cards = await cardRes.json();
			const pack = await packRes.json();

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
				props: { pack, cards, srcsetGroups }
			};
		} else {
			if (!cardRes.ok)
				return {
					status: cardRes.status,
					error: new Error(`Could not load card data.`)
				};
			else
				return {
					status: packRes.status,
					error: new Error(`Could not load pack data.`)
				};
		}
	}
</script>

<script lang="ts">
	import CardGallery from '$lib/cards/CardGallery.svelte';

	export let pack, cards, srcsetGroups;
</script>

<svelte:head>
	<title>{pack.name} - Tennin</title>
</svelte:head>

<CardGallery {cards} {srcsetGroups} />
