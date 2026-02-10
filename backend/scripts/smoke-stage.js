/* eslint-disable no-console */
const base = (process.env.SMOKE_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const username = process.env.SMOKE_USERNAME || `u${Math.floor(Math.random() * 900 + 100)}`;
const password = process.env.SMOKE_PASSWORD || 'StagePass1!';

const request = async (path, init = {}) => {
  const response = await fetch(`${base}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(`${path} -> ${message}`);
  }
  return data;
};

const main = async () => {
  const health = await fetch(base.replace(/\/api\/v1$/, '/'));
  if (!health.ok) {
    throw new Error(`health endpoint failed with ${health.status}`);
  }

  await request('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const signin = await request('/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const headers = {
    Authorization: `Bearer ${signin.token}`,
    'Content-Type': 'application/json'
  };

  const added = await request('/content', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'link',
      link: 'https://react.dev',
      title: 'React Docs',
      tags: ['react', 'frontend']
    })
  });

  const suggest = await request('/content/ai/suggest', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'React docs guide',
      description: 'A guide for building UIs with React components',
      link: 'https://react.dev',
      type: 'link'
    })
  });

  const search = await request('/content/ai/search?query=react%20components&limit=5', {
    method: 'GET',
    headers: { Authorization: `Bearer ${signin.token}` }
  });

  const content = await request('/content', {
    method: 'GET',
    headers: { Authorization: `Bearer ${signin.token}` }
  });

  console.log(
    JSON.stringify(
      {
        user: username,
        addSuccess: added.message === 'Content added successfully',
        aiInAddResponse: Boolean(added.ai),
        suggestTags: Array.isArray(suggest.tags) ? suggest.tags.length : 0,
        suggestSummary: Boolean(suggest.summary),
        semanticResultCount: Array.isArray(search.results) ? search.results.length : 0,
        semanticSource: search.source,
        contentCount: Array.isArray(content.content) ? content.content.length : 0
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
