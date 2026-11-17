/**
 * Initial static hash-route fixture. This is deliberately not a frozen
 * app-wide router API; ADR-002 still requires owner approval.
 */
export const navigation = [
  { id: 'dashboard', path: '/', title: 'Dashboard' },
  { id: 'drive', path: '/drive', title: 'Drive' },
  { id: 'diagnostics', path: '/diagnostics', title: 'Diagnostics' },
  { id: 'settings', path: '/settings', title: 'Settings' },
] as const;

export type RouteId = (typeof navigation)[number]['id'];
export type RouteSelection = RouteId | 'not-found';

export function resolveHashRoute(hash: string): RouteSelection {
  if (hash === '' || hash === '#') {
    return 'dashboard';
  }

  return navigation.find((route) => '#' + route.path === hash)?.id ?? 'not-found';
}

export function routeHref(id: RouteId): string {
  const route = navigation.find((candidate) => candidate.id === id);

  if (!route) {
    throw new RangeError('Unknown route ID');
  }

  return '#' + route.path;
}
