export function parseReviews(raw) {
  return raw
    .filter((r) => r.review_id)
    .map((r) => ({
      ...r,
      review_date: new Date(r.review_date),

      rating_overall:
        r.rating_overall != null
          ? Number(r.rating_overall)
          : null,

      rating_cleanliness:
        r.rating_cleanliness != null
          ? Number(r.rating_cleanliness)
          : null,

      rating_communication:
        r.rating_communication != null
          ? Number(r.rating_communication)
          : null,

      rating_checkin:
        r.rating_checkin != null
          ? Number(r.rating_checkin)
          : null,

      rating_accuracy:
        r.rating_accuracy != null
          ? Number(r.rating_accuracy)
          : null,

      rating_location:
        r.rating_location != null
          ? Number(r.rating_location)
          : null,

      rating_value:
        r.rating_value != null
          ? Number(r.rating_value)
          : null,

      host_response:
        r.host_response?.trim()
          ? r.host_response
          : null,
    }));
}