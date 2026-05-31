/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as archives from "../archives.js";
import type * as attendance from "../attendance.js";
import type * as events from "../events.js";
import type * as friendships from "../friendships.js";
import type * as http from "../http.js";
import type * as lib_analytics_analyticsEngine from "../lib/analytics/analyticsEngine.js";
import type * as lib_embeddings_cosineSimilarity from "../lib/embeddings/cosineSimilarity.js";
import type * as lib_embeddings_generateEventEmbedding from "../lib/embeddings/generateEventEmbedding.js";
import type * as lib_embeddings_generateUserEmbedding from "../lib/embeddings/generateUserEmbedding.js";
import type * as lib_recommendation_deadlineScore from "../lib/recommendation/deadlineScore.js";
import type * as lib_recommendation_explanationGenerator from "../lib/recommendation/explanationGenerator.js";
import type * as lib_recommendation_finalScore from "../lib/recommendation/finalScore.js";
import type * as lib_recommendation_freshnessScore from "../lib/recommendation/freshnessScore.js";
import type * as lib_recommendation_recommendationEngine from "../lib/recommendation/recommendationEngine.js";
import type * as lib_recommendation_semanticScore from "../lib/recommendation/semanticScore.js";
import type * as lib_recommendation_socialScore from "../lib/recommendation/socialScore.js";
import type * as lib_recommendation_trendScore from "../lib/recommendation/trendScore.js";
import type * as lib_utils_dateUtils from "../lib/utils/dateUtils.js";
import type * as lib_utils_scoreUtils from "../lib/utils/scoreUtils.js";
import type * as notifications from "../notifications.js";
import type * as organizers from "../organizers.js";
import type * as recommendations from "../recommendations.js";
import type * as registrations from "../registrations.js";
import type * as seed from "../seed.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  archives: typeof archives;
  attendance: typeof attendance;
  events: typeof events;
  friendships: typeof friendships;
  http: typeof http;
  "lib/analytics/analyticsEngine": typeof lib_analytics_analyticsEngine;
  "lib/embeddings/cosineSimilarity": typeof lib_embeddings_cosineSimilarity;
  "lib/embeddings/generateEventEmbedding": typeof lib_embeddings_generateEventEmbedding;
  "lib/embeddings/generateUserEmbedding": typeof lib_embeddings_generateUserEmbedding;
  "lib/recommendation/deadlineScore": typeof lib_recommendation_deadlineScore;
  "lib/recommendation/explanationGenerator": typeof lib_recommendation_explanationGenerator;
  "lib/recommendation/finalScore": typeof lib_recommendation_finalScore;
  "lib/recommendation/freshnessScore": typeof lib_recommendation_freshnessScore;
  "lib/recommendation/recommendationEngine": typeof lib_recommendation_recommendationEngine;
  "lib/recommendation/semanticScore": typeof lib_recommendation_semanticScore;
  "lib/recommendation/socialScore": typeof lib_recommendation_socialScore;
  "lib/recommendation/trendScore": typeof lib_recommendation_trendScore;
  "lib/utils/dateUtils": typeof lib_utils_dateUtils;
  "lib/utils/scoreUtils": typeof lib_utils_scoreUtils;
  notifications: typeof notifications;
  organizers: typeof organizers;
  recommendations: typeof recommendations;
  registrations: typeof registrations;
  seed: typeof seed;
  teams: typeof teams;
  users: typeof users;
  venues: typeof venues;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
