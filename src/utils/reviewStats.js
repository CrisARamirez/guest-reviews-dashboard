import _ from "lodash";

export function getPortfolioStats(reviews) {
  if (!reviews.length) {
    return {
      total: 0,
      avgRating: null,
      portfolioTrend: null,
      responseRate: 0,
      withResponse: 0,

      ratingDist: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  const rated = reviews.filter(
    (r) => r.rating_overall != null
  );

  const avgRating = rated.length
    ? _.meanBy(rated, "rating_overall")
    : null;

  const withResponse = reviews.filter(
    (r) => r.host_response
  ).length;

  const responseRate = Math.round(
    (withResponse / reviews.length) * 100
  );

  const ratingDist = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  rated.forEach((r) => {
    const rounded = Math.round(r.rating_overall);

    if (ratingDist[rounded] != null) {
      ratingDist[rounded]++;
    }
  });

  const now = new Date();

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const recent = rated.filter(
    (r) => r.review_date >= sixMonthsAgo
  );

  const prior = rated.filter(
    (r) =>
      r.review_date >= twelveMonthsAgo &&
      r.review_date < sixMonthsAgo
  );

  const recentAvg = recent.length
    ? _.meanBy(recent, "rating_overall")
    : null;

  const priorAvg = prior.length
    ? _.meanBy(prior, "rating_overall")
    : null;

  const portfolioTrend =
    recentAvg != null && priorAvg != null
      ? recentAvg - priorAvg
      : null;

  return {
    total: reviews.length,

    avgRating:
      avgRating != null
        ? Number(avgRating.toFixed(2))
        : null,

    portfolioTrend:
      portfolioTrend != null
        ? Number(portfolioTrend.toFixed(2))
        : null,

    responseRate,

    withResponse,

    ratingDist,
  };
}

export function getPropertyStats(reviews) {
  return _(reviews)
    .groupBy("property_id")
    .map((group, property_id) => {
      const withRating = group.filter(
        (r) => r.rating_overall != null
      );

      const avgRating = withRating.length
        ? _.meanBy(withRating, "rating_overall")
        : null;

      const now = new Date();

      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      const recent = group.filter(
        (r) =>
          r.review_date >= sixMonthsAgo &&
          r.rating_overall != null
      );

      const prior = group.filter(
        (r) =>
          r.review_date >= twelveMonthsAgo &&
          r.review_date < sixMonthsAgo &&
          r.rating_overall != null
      );

      const recentAvg = recent.length
        ? _.meanBy(recent, "rating_overall")
        : null;

      const priorAvg = prior.length
        ? _.meanBy(prior, "rating_overall")
        : null;

      const trend =
        recentAvg != null && priorAvg != null
          ? recentAvg - priorAvg
          : null;

      const isAnomaly =
        trend != null && trend < -0.5;

      const subRatings = {};

      for (const key of [
        "rating_cleanliness",
        "rating_communication",
        "rating_checkin",
        "rating_accuracy",
        "rating_location",
        "rating_value",
      ]) {
        const vals = group
          .map((r) => r[key])
          .filter((v) => v != null);

        subRatings[key] = vals.length
          ? {
              avg: _.mean(vals),
              n: vals.length,
            }
          : null;
      }

      return {
        property_id,

        property_name: group[0].property_name,

        city: group[0].city,

        country: group[0].country,

        channel:
          _(group)
            .countBy("channel")
            .toPairs()
            .maxBy(([, n]) => n)?.[0] ?? "—",

        reviewCount: group.length,

        avgRating:
          avgRating != null
            ? Math.round(avgRating * 100) / 100
            : null,

        recentAvg:
          recentAvg != null
            ? Math.round(recentAvg * 100) / 100
            : null,

        priorAvg:
          priorAvg != null
            ? Math.round(priorAvg * 100) / 100
            : null,

        trend:
          trend != null
            ? Math.round(trend * 100) / 100
            : null,

        isAnomaly,

        responseRate: Math.round(
          (group.filter((r) => r.host_response).length /
            group.length) *
            100
        ),

        lastReview:
          _.maxBy(group, (r) => r.review_date)
            ?.review_date ?? null,

        subRatings,
      };
    })
    .sortBy((p) => p.avgRating ?? 99)
    .value();
}

export function getUnansweredQueue(reviews) {
  const today = new Date();

  return reviews
    .filter((r) => !r.host_response)
    .map((r) => {
      const rating = r.rating_overall ?? 3;
      const daysSinceReview = Math.floor(
        (today - r.review_date) / 86_400_000
      );
      
      // Priority score formula:
      // - Rating severity (5 - rating) is the PRIMARY factor with 100x weight
      // - Days acts as tie-breaker but capped at 30 days max
      // - This ensures: 1⭐ 180d (430) > 2⭐ 2d (302), but recent reviews still matter
      const cappedDays = Math.min(daysSinceReview, 30);
      const priorityScore = (5 - rating) * 100 + cappedDays;
      
      return {
        ...r,
        priorityScore,
      };
    })
    .sort(
      (a, b) => b.priorityScore - a.priorityScore
    );
}