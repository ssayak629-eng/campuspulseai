import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Provider Profiles ───────────────────────────────────────────────────────
export const getProviderByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("venueProviders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const createProvider = mutation({
  args: {
    userId: v.id("users"),
    organizationName: v.string(),
    description: v.optional(v.string()),
    contactEmail: v.string(),
    contactPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("venueProviders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        organizationName: args.organizationName,
        description: args.description,
        contactEmail: args.contactEmail,
        contactPhone: args.contactPhone,
      });
      return existing._id;
    }

    return await ctx.db.insert("venueProviders", {
      userId: args.userId,
      organizationName: args.organizationName,
      description: args.description,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      verified: false,
      averageRating: 5.0,
      totalRatings: 0,
      createdAt: Date.now(),
    });
  },
});

// ─── Venue Inventory Management ──────────────────────────────────────────────
export const createVenue = mutation({
  args: {
    providerId: v.id("venueProviders"),
    venueId: v.optional(v.id("venues")),
    name: v.string(),
    description: v.string(),
    venueType: v.string(),
    city: v.string(),
    state: v.string(),
    address: v.string(),
    seatingCapacity: v.number(),
    standingCapacity: v.number(),
    facilities: v.object({
      ac: v.boolean(),
      wifi: v.boolean(),
      projector: v.boolean(),
      smartBoard: v.boolean(),
      soundSystem: v.boolean(),
      microphone: v.boolean(),
      parking: v.boolean(),
      generatorBackup: v.boolean(),
      drinkingWater: v.boolean(),
      cafeteria: v.boolean(),
      washroom: v.boolean(),
      wheelchairAccessible: v.boolean(),
      securityStaff: v.boolean(),
      stage: v.boolean(),
      greenRoom: v.boolean(),
      computerLab: v.boolean(),
      powerSockets: v.boolean(),
      internetSpeedMbps: v.number(),
      hostelNearby: v.boolean(),
      accommodationAvailable: v.boolean(),
      foodAvailable: v.boolean(),
      recordingEquipment: v.boolean(),
      livestreamSupport: v.boolean(),
    }),
    rooms: v.array(
      v.object({
        roomNumber: v.string(),
        roomName: v.string(),
        roomType: v.string(),
        floor: v.number(),
        length: v.number(),
        width: v.number(),
        areaSqMeters: v.number(),
        capacity: v.number(),
        tableCount: v.number(),
        chairCount: v.number(),
        hasAC: v.boolean(),
        hasProjector: v.boolean(),
        hasSmartBoard: v.boolean(),
        imageUrls: v.array(v.string()),
      })
    ),
    pricing: v.object({
      hourlyRate: v.number(),
      minimumBookingHours: v.number(),
      refundableDeposit: v.number(),
    }),
    imageUrls: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const venueData = {
      providerId: args.providerId,
      name: args.name,
      description: args.description,
      venueType: args.venueType,
      city: args.city,
      state: args.state,
      address: args.address,
      seatingCapacity: args.seatingCapacity,
      standingCapacity: args.standingCapacity,
      facilities: args.facilities,
      rooms: args.rooms,
      pricing: args.pricing,
      imageUrls: args.imageUrls,
      isActive: args.isActive,
      updatedAt: Date.now(),
    };

    if (args.venueId) {
      await ctx.db.patch(args.venueId, venueData);
      return args.venueId;
    }

    return await ctx.db.insert("venues", {
      ...venueData,
      averageRating: 5.0,
      totalRatings: 0,
      createdAt: Date.now(),
    });
  },
});

export const getVenuesByProvider = query({
  args: { providerId: v.id("venueProviders") },
  handler: async (ctx, { providerId }) => {
    return await ctx.db
      .query("venues")
      .withIndex("by_provider", (q) => q.eq("providerId", providerId))
      .collect();
  },
});

export const getVenueById = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, { venueId }) => {
    return await ctx.db.get(venueId);
  },
});

// ─── Intelligent Match Score Calculation ─────────────────────────────────────
export const listAvailableVenues = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) return [];

    const eventCapacity = event.maxParticipants ?? 0;
    const eventDurationHours = Math.max(0.5, (event.endDate - event.startDate) / 3600000);
    const eventBudget = event.budget ?? 5000;

    // Fetch all active venues
    const activeVenues = await ctx.db
      .query("venues")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const matchedVenues = [];

    for (const venue of activeVenues) {
      const venueCapacity = venue.seatingCapacity + venue.standingCapacity;

      // ─── HARD FILTERS ───
      // 1. Capacity Hard Filter
      if (venueCapacity < eventCapacity) continue;

      // 2. Calendar Overlap Hard Filter
      const calendarOverlaps = await ctx.db
        .query("venueAvailabilityCalendar")
        .withIndex("by_venue", (q) => q.eq("venueId", venue._id))
        .collect();

      const hasConflict = calendarOverlaps.some(
        (c) =>
          c.status !== "available" &&
          c.startDate < event.endDate &&
          c.endDate > event.startDate
      );
      if (hasConflict) continue;

      // 3. Room capacity constraints if event requires specialized rooms

      // ─── SOFT MATCH CALCULATIONS ───

      // A. RequirementMatch: Checklist of facilities required
      let requirementMatch = 1.0;
      if (event.facilitiesRequired) {
        let requestedCount = 0;
        let satisfiedCount = 0;
        Object.entries(event.facilitiesRequired).forEach(([facility, req]) => {
          if (typeof req === "boolean" && req === true) {
            requestedCount++;
            if (venue.facilities[facility] === true) {
              satisfiedCount++;
            }
          } else if (facility === "internetSpeedMbps" && typeof req === "number" && req > 0) {
            requestedCount++;
            if ((venue.facilities.internetSpeedMbps ?? 0) >= req) {
              satisfiedCount++;
            }
          }
        });
        if (requestedCount > 0) {
          requirementMatch = satisfiedCount / requestedCount;
        }
      }

      // B. CapacityMatch: Oversizing decay
      const capacityRatio = venueCapacity > 0 ? (venueCapacity - eventCapacity) / venueCapacity : 0;
      const capacityMatch = 1.0 - Math.min(0.5, capacityRatio);

      // C. LocationMatch: Event city compatibility
      const locationMatch = venue.city.toLowerCase() === (event.venue ?? "").toLowerCase() ? 1.0 : 0.2;

      // D. BudgetMatch: Duration & Minimum hour rate calculations
      const billableHours = Math.max(eventDurationHours, venue.pricing.minimumBookingHours);
      const calculatedCost = billableHours * venue.pricing.hourlyRate;
      const totalPayable = calculatedCost + venue.pricing.refundableDeposit;

      let budgetMatch = 1.0;
      if (calculatedCost > eventBudget) {
        budgetMatch = Math.max(0.0, 1.0 - (calculatedCost - eventBudget) / eventBudget);
      }

      // Final Matching Score Formula
      const matchScore =
        0.50 * requirementMatch +
        0.20 * capacityMatch +
        0.15 * locationMatch +
        0.15 * budgetMatch;

      matchedVenues.push({
        venue,
        calculatedCost,
        refundableDeposit: venue.pricing.refundableDeposit,
        totalPayable,
        durationHours: eventDurationHours,
        billableHours,
        matchScore,
        matchDetails: {
          requirementMatch,
          capacityMatch,
          locationMatch,
          budgetMatch,
        },
      });
    }

    // Sort by MatchScore Descending
    return matchedVenues.sort((a, b) => b.matchScore - a.matchScore);
  },
});

// ─── Venue Booking Requests ─────────────────────────────────────────────────
export const requestVenue = mutation({
  args: {
    eventId: v.id("events"),
    venueId: v.id("venues"),
    organizerId: v.id("users"),
    providerId: v.id("venueProviders"),
    matchScore: v.float64(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("venueRequests")
      .withIndex("by_event_venue", (q) => q.eq("eventId", args.eventId).eq("venueId", args.venueId))
      .unique();

    if (existing) return existing._id;

    const reqId = await ctx.db.insert("venueRequests", {
      eventId: args.eventId,
      venueId: args.venueId,
      organizerId: args.organizerId,
      providerId: args.providerId,
      matchScore: args.matchScore,
      status: "pending",
      createdAt: Date.now(),
    });

    // In-app Notification for provider
    const provider = await ctx.db.get(args.providerId);
    if (provider) {
      await ctx.db.insert("notifications", {
        userId: provider.userId,
        title: "New Venue Request",
        message: "An organizer requested your venue. View details to accept.",
        type: "venue",
        isRead: false,
        relatedId: reqId,
        createdAt: Date.now(),
      });
    }

    return reqId;
  },
});

export const getRequestsByVenue = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, { venueId }) => {
    const requests = await ctx.db
      .query("venueRequests")
      .withIndex("by_venue", (q) => q.eq("venueId", venueId))
      .collect();

    const results = [];
    for (const req of requests) {
      const event = await ctx.db.get(req.eventId);
      const organizer = await ctx.db.get(req.organizerId);
      if (event) {
        results.push({
          request: req,
          event,
          organizer,
        });
      }
    }
    return results.sort((a, b) => b.request.matchScore - a.request.matchScore);
  },
});

export const getRequestsByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const requests = await ctx.db
      .query("venueRequests")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    const results = [];
    for (const req of requests) {
      const venue = await ctx.db.get(req.venueId);
      const provider = await ctx.db.get(req.providerId);
      if (venue) {
        results.push({
          request: req,
          venue,
          provider,
        });
      }
    }
    return results;
  },
});

// Update Request Status by Venue Provider (Accept/Reject)
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("venueRequests"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { requestId, status }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");

    await ctx.db.patch(requestId, { status });

    const venue = await ctx.db.get(request.venueId);
    const provider = await ctx.db.get(request.providerId);

    if (status === "accepted" && venue) {
      await ctx.db.patch(request.eventId, {
        venue: venue.name,
      });
    }

    // Email dispatch trigger logging
    console.log(`[MOCK EMAIL SENT] To event owner of eventId ${request.eventId}: Request status updated to ${status}. Venue: ${venue?.name}, Provider: ${provider?.organizationName}`);

    // In-app Notification for organizer
    await ctx.db.insert("notifications", {
      userId: request.organizerId,
      title: status === "accepted" ? "Venue Booking Approved" : "Venue Request Rejected",
      message: status === "accepted"
        ? `Your request for venue "${venue?.name}" was accepted! Click to confirm your final booking.`
        : `Your request for venue "${venue?.name}" was declined.`,
      type: "venue",
      isRead: false,
      relatedId: request._id,
      createdAt: Date.now(),
    });
  },
});

// Organizer Confirmation (Booking Created, Competitors Declined, Calendar Blocked, Event Updated)
export const confirmVenueBooking = mutation({
  args: {
    requestId: v.id("venueRequests"),
  },
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");

    const event = await ctx.db.get(request.eventId);
    const venue = await ctx.db.get(request.venueId);
    const provider = await ctx.db.get(request.providerId);
    if (!event || !venue || !provider) throw new Error("Linked data not found");

    // 1. Update active request status to "confirmed"
    await ctx.db.patch(requestId, { status: "confirmed" });

    // 2. Set all other requests for this event to "declined"
    const allEventRequests = await ctx.db
      .query("venueRequests")
      .withIndex("by_event", (q) => q.eq("eventId", request.eventId))
      .collect();

    for (const r of allEventRequests) {
      if (r._id !== requestId) {
        await ctx.db.patch(r._id, { status: "declined" });
      }
    }

    // 3. Create Booking Details
    const eventDurationHours = Math.max(0.5, (event.endDate - event.startDate) / 3600000);
    const billableHours = Math.max(eventDurationHours, venue.pricing.minimumBookingHours);
    const calculatedCost = billableHours * venue.pricing.hourlyRate;
    const totalPayable = calculatedCost + venue.pricing.refundableDeposit;

    const bookingId = await ctx.db.insert("venueBookings", {
      eventId: request.eventId,
      venueId: request.venueId,
      organizerId: request.organizerId,
      providerId: request.providerId,
      durationHours: eventDurationHours,
      billableHours,
      hourlyRate: venue.pricing.hourlyRate,
      calculatedCost,
      refundableDeposit: venue.pricing.refundableDeposit,
      totalPayable,
      bookingStatus: "confirmed",
      bookedAt: Date.now(),
    });

    // 4. Block Availability Calendar
    await ctx.db.insert("venueAvailabilityCalendar", {
      venueId: request.venueId,
      startDate: event.startDate,
      endDate: event.endDate,
      status: "booked",
      createdAt: Date.now(),
    });

    // 5. Update the Event Venue name to confirmed venue
    await ctx.db.patch(request.eventId, {
      venue: venue.name,
    });

    // 6. Notifications and Email Logs
    console.log(`[MOCK EMAIL CONFIRMED] Booking invoice dispatch: $${totalPayable}. Sent to organizer ${request.organizerId} and provider ${provider.contactEmail}`);

    // Notify Organizer
    await ctx.db.insert("notifications", {
      userId: request.organizerId,
      title: "Venue Booking Confirmed",
      message: `Your booking at "${venue.name}" has been officially secured! Event venue is active.`,
      type: "venue",
      isRead: false,
      relatedId: bookingId,
      createdAt: Date.now(),
    });

    // Notify Provider
    await ctx.db.insert("notifications", {
      userId: provider.userId,
      title: "Venue Booked Successfully",
      message: `Event "${event.title}" confirmed their booking at "${venue.name}" for $${totalPayable}.`,
      type: "venue",
      isRead: false,
      relatedId: bookingId,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

// ─── Calendar Management ─────────────────────────────────────────────────────
export const blockVenueCalendar = mutation({
  args: {
    venueId: v.id("venues"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal("blocked"),
      v.literal("maintenance"),
      v.literal("reserved"),
      v.literal("booked")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("venueAvailabilityCalendar", {
      venueId: args.venueId,
      startDate: args.startDate,
      endDate: args.endDate,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const getVenueCalendar = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, { venueId }) => {
    return await ctx.db
      .query("venueAvailabilityCalendar")
      .withIndex("by_venue", (q) => q.eq("venueId", venueId))
      .collect();
  },
});

// ─── Active Bookings Dashboard ───────────────────────────────────────────────
export const getProviderActiveBookings = query({
  args: { providerId: v.id("venueProviders") },
  handler: async (ctx, { providerId }) => {
    const bookings = await ctx.db
      .query("venueBookings")
      .withIndex("by_provider", (q) => q.eq("providerId", providerId))
      .collect();

    const activeBookings = bookings.filter((b) => b.bookingStatus === "confirmed");

    const results = [];
    for (const b of activeBookings) {
      const venue = await ctx.db.get(b.venueId);
      const event = await ctx.db.get(b.eventId);
      if (venue && event) {
        results.push({
          booking: b,
          venue,
          event,
        });
      }
    }
    return results;
  },
});

export const getOrganizerVenueRequests = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, { organizerId }) => {
    const requests = await ctx.db
      .query("venueRequests")
      .withIndex("by_organizer", (q) => q.eq("organizerId", organizerId))
      .collect();

    const results = [];
    for (const req of requests) {
      const venue = await ctx.db.get(req.venueId);
      if (venue) {
        results.push({
          request: req,
          venue,
        });
      }
    }
    return results;
  },
});

