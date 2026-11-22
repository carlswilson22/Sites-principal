// A query string keeps individual model hubs linkable on GitHub Pages and Vite.
export function modelHubHref(base, id) {
  return `${base}?modelo=${encodeURIComponent(id)}`;
}

export function findSelectedModel(search, models) {
  const id = new URLSearchParams(search).get('modelo');
  return models.find(model => model.id === id && model.status === 'available') || null;
}
