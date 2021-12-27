<script lang="ts">
	export let card;
</script>

<div class="card">
	<h1 class="title">
		<span class:unique={card.uniqueness}>{card.title}</span>
		{#if card.cost !== undefined}
			<span class="cost">
				{card.cost !== null ? card.cost : 'X'}
				<span class="icon-credit" />
			</span>
		{/if}
		{#if card.advancement_cost !== undefined}
			<span class="advancement cost">
				{card.advancement_cost}
				/
				{card.agenda_points}
			</span>
		{/if}
		{#if card.type.code === 'identity' && card.side.code === 'runner'}
			<span class="link">
				<span class="icon-link" />
				{card.base_link}
			</span>
		{/if}
	</h1>
	<p class="faction" style={`color: #${card.faction.color};`}>
		{card.faction.name}
		{#if card.faction_cost !== undefined}
			<!-- <span style={`color: #000;`}>•</span> -->
			{'●'.repeat(card.faction_cost)}
		{/if}
	</p>
	<p class="types">
		{card.resolved_types}

		{#if card.trash_cost !== undefined}
			<span class="trash">
				{card.trash_cost}
				<span class="icon-trash" />
			</span>
		{/if}
	</p>
	{#if card.minimum_deck_size !== undefined}
		<p class="decksize">
			Deck size: {card.minimum_deck_size} • Influence: {card.influence_limit || '∞'}
		</p>
	{/if}
	<div class="text">
		{#each card.parsed_text.split('<br>') as line}
			<p>{@html line}</p>
		{/each}
	</div>
	{#if card.strength !== undefined}
		<p class="strength">{card.strength} strength</p>
	{/if}
	{#if card.flavor}
		<p class="flavor">{@html card.flavor}</p>
	{/if}
	<p class="illustrator">
		Illustrated by
		<a href={`/search?q=${encodeURIComponent(`illustrator:"${card.illustrator}"`)}`}>
			{card.illustrator}
		</a>
	</p>
</div>

<style lang="scss">
	@import '$static/font/Netrunner/style.css';

	.card {
		border: 1px solid;
		border-radius: 5px;
		padding: 10px;
		padding-bottom: 0;
		word-break: break-word;
		position: relative;
		font-size: 14px;

		.title {
			font-size: 16px;

			.unique::before {
				content: '♢ ';
			}
		}

		.title,
		.types {
			display: grid;
			align-items: flex-start;
			justify-content: space-between;
			grid-template-columns: minmax(min-content, max-content) max-content;
			margin: 0px;

			> :nth-child(2) {
				margin-left: 20px;
			}
		}

		.faction {
			margin-top: 0px;
		}

		.text {
			border: 1px solid;
			border-radius: 5px;
			padding: 10px;
			margin: 16px 0;

			> :first-child {
				margin-top: 0;
			}
			> :last-child {
				margin-bottom: 0;
			}
		}

		.flavor {
			font-style: italic;
			margin-right: 10px;
		}

		> :last-child {
			margin-bottom: 10px;
		}
	}
</style>
