<script lang="ts" context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export async function load({ _, fetch }) {
		let res = await fetch('/api/cycles');

		if (res.ok) {
			let data = await res.json();

			return {
				props: {
					cycles: data
				}
			};
		} else {
			return {
				status: res.status,
				error: new Error(`Could not load set data.`)
			};
		}
	}
</script>

<script lang="ts">
	export let cycles;

	export const prerender = true;
</script>

<table class="sets">
	<tr>
		<th>Name</th>
		<th>Cards</th>
		<th>Date</th>
	</tr>
	{#each cycles as cycle}
		{#if cycle.size !== 1}
			<tr class="cycle">
				<td class="name">
					<a href="/cycles/{cycle.code}">
						{cycle.name}
						<code>
							{cycle.code}
						</code>
					</a>
				</td>
				<td>{cycle.packs.map((pack) => pack.size).reduce((a, b) => a + b, 0)}</td>
				<td>
					{cycle.packs
						.map((pack) => pack.date_release.slice(0, 10))
						.sort()
						.at(-1)}
				</td>
			</tr>

			{#each cycle.packs.sort((a, b) => b.position - a.position) as pack}
				<tr class="pack">
					<td class="name">
						<a href="/packs/{pack.code}">
							{pack.name}
							<code>
								{pack.code}
							</code>
						</a>
					</td>
					<td>{pack.size}</td>
					<td>{pack.date_release.slice(0, 10)}</td>
				</tr>
			{/each}
		{:else}
			<tr class="cycle">
				<td class="name">
					<a href="/packs/{cycle.packs[0].code}">
						{cycle.name}
						<code>
							{cycle.packs[0].code}
						</code>
					</a>
				</td>
				<td>{cycle.packs[0].size}</td>
				<td>{cycle.packs[0].date_release.slice(0, 10)}</td>
			</tr>
		{/if}
	{/each}
</table>

<style lang="scss">
	.sets {
		text-align: left;
		border-spacing: 0;
		border-collapse: collapse;

		tr {
			line-height: 30px;

			&:nth-child(even) {
				background-color: rgba(0, 0, 0, 0.05);
			}

			&:hover:not(:first-child) {
				background-color: rgba(0, 0, 0, 0.1);
			}

			&.pack > .name > a::before {
				color: #ddd;
				content: '↳';
				margin-right: 5px;
			}

			th {
				text-transform: uppercase;
				font-weight: 500;
				font-size: 12px;
			}

			td,
			th {
				padding-left: 5px;
			}

			.name {
				display: grid;
				padding-left: 5px;

				a {
					color: #000;
					text-decoration: none;
				}

				code {
					color: #9b9b9b;
					font-size: 14px;
				}
			}
		}
	}
</style>
