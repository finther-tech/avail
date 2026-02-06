import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto automatically chooses an adapter based on the environment
		// For Vercel deployment, it will use @sveltejs/adapter-vercel
		adapter: adapter()
	}
};

export default config;
