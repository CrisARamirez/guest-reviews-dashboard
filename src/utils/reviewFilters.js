export function applyFilters(reviews, filters) {
  return reviews.filter((r) => {
    // Multi-select filters: empty array means "all selected"
    if (filters.cities.length > 0 && !filters.cities.includes(r.city)) {
      return false;
    }

    if (filters.channels.length > 0 && !filters.channels.includes(r.channel)) {
      return false;
    }

    if (filters.languages.length > 0 && !filters.languages.includes(r.language)) {
      return false;
    }

    if (
      filters.properties.length > 0 &&
      !filters.properties.includes(r.property_id)
    ) {
      return false;
    }

    if (r.rating_overall != null) {
      if (
        r.rating_overall < filters.minRating ||
        r.rating_overall > filters.maxRating
      ) {
        return false;
      }
    }

    if (
      filters.dateFrom &&
      r.review_date < new Date(filters.dateFrom)
    ) {
      return false;
    }

    if (
      filters.dateTo &&
      r.review_date > new Date(filters.dateTo)
    ) {
      return false;
    }

    return true;
  });
}