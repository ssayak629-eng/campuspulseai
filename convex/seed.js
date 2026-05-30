import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const users = [];

        const userData = [
            {
                clerkId: "clerk_1",
                email: "sayak@college.edu",
                name: "Sayak",
                role: "student",
                department: "CSE",
                year: "3rd",
                interests: ["AI", "Web Development", "Hackathons"],
                skills: ["React", "Node.js", "Python"],
                embedding: [0.9, 0.2, 0.5, 0.8],
            },
            {
                clerkId: "clerk_2",
                email: "ananya@college.edu",
                name: "Ananya",
                role: "student",
                department: "ECE",
                year: "2nd",
                interests: ["Robotics", "IoT", "AI"],
                skills: ["Arduino", "C++", "ML"],
                embedding: [0.7, 0.8, 0.3, 0.6],
            },
            {
                clerkId: "clerk_3",
                email: "rahul@college.edu",
                name: "Rahul",
                role: "organizer",
                department: "CSE",
                year: "4th",
                interests: ["Cybersecurity", "Competitive Programming"],
                skills: ["C++", "Linux", "Networking"],
                embedding: [0.3, 0.9, 0.4, 0.5],
            },
            {
                clerkId: "clerk_4",
                email: "priya@college.edu",
                name: "Priya",
                role: "student",
                department: "IT",
                year: "1st",
                interests: ["UI/UX", "Design", "Frontend"],
                skills: ["Figma", "React", "Tailwind"],
                embedding: [0.8, 0.3, 0.9, 0.4],
            },
            {
                clerkId: "clerk_5",
                email: "arjun@college.edu",
                name: "Arjun",
                role: "student",
                department: "ME",
                year: "3rd",
                interests: ["Robotics", "3D Printing"],
                skills: ["CAD", "Embedded Systems"],
                embedding: [0.5, 0.7, 0.6, 0.2],
            },
        ];

        for (const user of userData) {
            const id = await ctx.db.insert("users", {
                ...user,
                imageUrl: "",
                createdAt: now,
            });

            users.push(id);
        }

        const events = [];

        const eventData = [
            {
                title: "AI Hackathon 2026",
                description:
                    "24-hour AI-focused hackathon with exciting prizes.",
                category: "Hackathon",
                tags: ["AI", "ML", "Hackathon"],
                venue: "Main Auditorium",
                startDate: now + 86400000,
                endDate: now + 172800000,
                registrationDeadline: now + 43200000,
                maxParticipants: 200,
                posterUrl: "",
                embedding: [0.9, 0.1, 0.8, 0.7],
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
                visibility: "public",
            },
            {
                title: "Cybersecurity Workshop",
                description:
                    "Hands-on ethical hacking and cybersecurity workshop.",
                category: "Workshop",
                tags: ["Cybersecurity", "Networking"],
                venue: "Lab 204",
                startDate: now + 259200000,
                endDate: now + 345600000,
                registrationDeadline: now + 200000000,
                maxParticipants: 80,
                posterUrl: "",
                embedding: [0.2, 0.9, 0.3, 0.6],
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
                visibility: "public",
            },
            {
                title: "Startup Pitch Fest",
                description:
                    "Pitch your startup ideas to mentors and investors.",
                category: "Entrepreneurship",
                tags: ["Startup", "Business", "Pitching"],
                venue: "Seminar Hall",
                startDate: now + 400000000,
                endDate: now + 450000000,
                registrationDeadline: now + 350000000,
                maxParticipants: 100,
                posterUrl: "",
                embedding: [0.6, 0.5, 0.4, 0.8],
                createdBy: users[0],
                createdAt: now,
                isArchived: false,
                visibility: "public",
            },
            {
                title: "UI/UX Design Bootcamp",
                description:
                    "Learn modern UI/UX principles and Figma workflows.",
                category: "Design",
                tags: ["UI", "UX", "Figma"],
                venue: "Innovation Lab",
                startDate: now + 500000000,
                endDate: now + 550000000,
                registrationDeadline: now + 450000000,
                maxParticipants: 60,
                posterUrl: "",
                embedding: [0.8, 0.2, 0.9, 0.3],
                createdBy: users[3],
                createdAt: now,
                isArchived: false,
                visibility: "public",
            },
        ];

        for (const event of eventData) {
            const id = await ctx.db.insert("events", event);

            events.push(id);
        }

        await ctx.db.insert("eventOrganizers", {
            eventId: events[0],
            userId: users[2],
            role: "owner",
            addedAt: now,
        });

        await ctx.db.insert("eventOrganizers", {
            eventId: events[0],
            userId: users[0],
            role: "organizer",
            addedAt: now,
        });

        await ctx.db.insert("eventOrganizers", {
            eventId: events[1],
            userId: users[2],
            role: "owner",
            addedAt: now,
        });

        const team1 = await ctx.db.insert("teams", {
            eventId: events[0],
            name: "Neural Ninjas",
            description: "AI enthusiasts team",
            createdBy: users[0],
            maxMembers: 4,
            createdAt: now,
        });

        await ctx.db.insert("teamMembers", {
            teamId: team1,
            userId: users[0],
            joinedAt: now,
        });

        await ctx.db.insert("teamMembers", {
            teamId: team1,
            userId: users[1],
            joinedAt: now,
        });

        await ctx.db.insert("friendships", {
            user1: users[0],
            user2: users[1],
            createdAt: now,
        });

        await ctx.db.insert("registrations", {
            eventId: events[0],
            userId: users[0],
            teamId: team1,
            registeredAt: now,
        });

        await ctx.db.insert("registrations", {
            eventId: events[0],
            userId: users[1],
            teamId: team1,
            registeredAt: now,
        });

        await ctx.db.insert("eventLikes", {
            eventId: events[0],
            userId: users[0],
            likedAt: now,
        });

        await ctx.db.insert("eventLikes", {
            eventId: events[3],
            userId: users[3],
            likedAt: now,
        });

        await ctx.db.insert("eventInteractions", {
            eventId: events[0],
            userId: users[0],
            interactionType: "viewed",
            createdAt: now,
        });

        await ctx.db.insert("eventInteractions", {
            eventId: events[0],
            userId: users[1],
            interactionType: "clicked",
            createdAt: now,
        });

        await ctx.db.insert("attendance", {
            eventId: events[0],
            userId: users[0],
            checkedInAt: now,
            qrToken: "QR_AI_001",
        });

        await ctx.db.insert("notifications", {
            userId: users[0],
            title: "Registration Successful",
            message: "You registered for AI Hackathon 2026",
            type: "registration",
            isRead: false,
            createdAt: now,
        });

        await ctx.db.insert("eventArchives", {
            eventId: events[0],
            attendanceCount: 150,
            photos: [
                "https://example.com/photo1.jpg",
                "https://example.com/photo2.jpg",
            ],
            recordings: [
                "https://example.com/video1.mp4",
            ],
            feedbackScore: 4.6,
            archivedAt: now,
        });

        return {
            success: true,
            usersCreated: users.length,
            eventsCreated: events.length,
        };
    },
});