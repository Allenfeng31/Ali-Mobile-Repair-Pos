type LocationBreadcrumbArea = {
  name: string;
  slug: string;
};

export function buildLocationBreadcrumbItems(
  baseUrl: string,
  area: LocationBreadcrumbArea,
) {
  const canonicalUrl = `${baseUrl}/locations/${area.slug}`;

  return [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${baseUrl}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: area.name,
      item: canonicalUrl,
    },
  ];
}
