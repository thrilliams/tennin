<script lang="ts">
	export let card;
	export let lazy = true;
	export let rotate = 0;

	export let srcsets: {
		webp: string;
		jpeg: string;
		single: string;
		thumbnail: string;
		full: string;
	};

	let sizes = '(max-width: 145px) 145px, (max-width: 290px) 290px, 580px';
</script>

<picture>
	<source {sizes} srcset={srcsets.webp} type="image/webp" />
	<source {sizes} srcset={srcsets.jpeg} type="image/jpeg" />
	<img
		loading={lazy ? 'lazy' : 'eager'}
		decoding="async"
		src={srcsets.single}
		alt={card.title}
		style={`background-image: url(${srcsets.thumbnail}); transform: rotate(${rotate}turn)`}
	/>
</picture>

<style lang="scss">
	picture {
		max-height: calc(((var(--max-width) - 20px) / 3) * 1.4);

		img {
			width: 100%;
			height: auto;
			border-radius: var(--radius);
			box-shadow: 1px 1px 8px rgb(0 0 0 / 50%);

			background-size: cover;
			object-fit: fill;

			width: 290px;
			height: 406px;

			transition: transform 0.4s;
		}
	}
</style>
