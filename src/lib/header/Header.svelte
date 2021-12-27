<script lang="ts">
	import logo from './tennin.svg';
	import { page } from '$app/stores';
</script>

<header>
	<div class="corner">
		<a sveltekit:prefetch href="/">
			<img src={logo} alt="Tennin" />
		</a>
	</div>

	<form action="/search">
		<input
			type="text"
			name="q"
			placeholder="Search for Netrunner cards..."
			value={$page.query.get('q')}
		/>
	</form>

	<nav>
		<ul>
			<li><a sveltekit:prefetch href="/advanced">Advanced</a></li>
			<li><a sveltekit:prefetch href="/docs/syntax">Syntax</a></li>
			<li><a sveltekit:prefetch href="/sets">Sets</a></li>
		</ul>
	</nav>
</header>

<style lang="scss">
	header {
		display: grid;
		align-content: center;
		justify-content: center;
		width: var(--max-width);
		margin: auto;

		grid-template-columns: auto 1fr auto;

		.corner {
			width: 3em;
			height: 3em;
			a {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
			}

			img {
				width: 2em;
				height: 2em;
			}
		}

		input {
			border: none;
			outline: none;

			width: 100%;
			height: 100%;
		}

		nav {
			ul {
				position: relative;
				padding: 0;
				margin: 0;
				height: 3em;
				display: flex;
				list-style: none;
			}

			a {
				display: flex;
				height: 100%;
				align-items: center;
				padding: 0 1em;
				color: var(--heading-color);
				text-decoration: none;

				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
</style>
