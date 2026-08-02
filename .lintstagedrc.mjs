const config = {
  "*.{js,mjs,cjs,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{css,json,md,mdx,yaml,yml}": "prettier --write",
};

export default config;
