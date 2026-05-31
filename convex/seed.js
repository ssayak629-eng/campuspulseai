import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const DAY = 86400000;

        // Clear existing tables to ensure a clean slate
        const existingUsers = await ctx.db.query("users").collect();
        for (const u of existingUsers) await ctx.db.delete(u._id);

        const existingEvents = await ctx.db.query("events").collect();
        for (const e of existingEvents) await ctx.db.delete(e._id);

        const existingRegistrations = await ctx.db.query("registrations").collect();
        for (const r of existingRegistrations) await ctx.db.delete(r._id);

        const existingFriends = await ctx.db.query("friendships").collect();
        for (const f of existingFriends) await ctx.db.delete(f._id);

        const existingTeams = await ctx.db.query("teams").collect();
        for (const t of existingTeams) await ctx.db.delete(t._id);

        const existingMembers = await ctx.db.query("teamMembers").collect();
        for (const m of existingMembers) await ctx.db.delete(m._id);

        const existingLikes = await ctx.db.query("eventLikes").collect();
        for (const l of existingLikes) await ctx.db.delete(l._id);

        const existingOrganizers = await ctx.db.query("eventOrganizers").collect();
        for (const o of existingOrganizers) await ctx.db.delete(o._id);

        const users = [];

        const userData = [
            {
                clerkId: "clerk_1",
                email: "sayak@college.edu",
                name: "Sayak",
                role: "student",
                department: "CSE",
                year: "3rd",
                interests: ["AI", "Web Development", "Hackathons", "Tech"],
                skills: ["React", "Node.js", "Python", "Javascript"],
            },
            {
                clerkId: "clerk_2",
                email: "ananya@college.edu",
                name: "Ananya",
                role: "student",
                department: "ECE",
                year: "2nd",
                interests: ["Robotics", "IoT", "AI", "Design"],
                skills: ["Arduino", "C++", "ML", "CAD"],
            },
            {
                clerkId: "clerk_3",
                email: "rahul@college.edu",
                name: "Rahul",
                role: "organizer",
                department: "CSE",
                year: "4th",
                interests: ["Cybersecurity", "Competitive Programming", "Networking"],
                skills: ["C++", "Linux", "Networking", "Python"],
            },
            {
                clerkId: "clerk_4",
                email: "priya@college.edu",
                name: "Priya",
                role: "student",
                department: "IT",
                year: "1st",
                interests: ["UI/UX", "Design", "Frontend", "Art"],
                skills: ["Figma", "React", "Tailwind", "CSS"],
            },
            {
                clerkId: "clerk_5",
                email: "arjun@college.edu",
                name: "Arjun",
                role: "student",
                department: "ME",
                year: "3rd",
                interests: ["Robotics", "3D Printing", "CAD"],
                skills: ["CAD", "Embedded Systems", "Robots"],
            },
        ];

        for (const user of userData) {
            const id = await ctx.db.insert("users", {
                ...user,
                imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`,
                createdAt: now,
            });
            users.push(id);
        }

        const events = [];

        const eventData = [
            {
                title: "AI Hackathon 2026",
                description: "Collaborate and innovate at our 24-hour AI hackathon. Develop creative machine learning solutions and pitch them to leading tech investors and research mentors.",
                category: "Hackathon",
                tags: ["AI", "ML", "Hackathon", "Coding"],
                venue: "Main Auditorium",
                startDate: now + 2 * DAY,
                endDate: now + 3 * DAY,
                registrationDeadline: now + DAY,
                maxParticipants: 200,
                posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=cover&w=800&q=80",
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "RoboWars: Circuit Combat",
                description: "Assemble your battle bots and compete in a high-octane mechanical arena. Features hands-on Arduino and Raspberry Pi hardware tuning workshops beforehand.",
                category: "Workshop",
                tags: ["Robotics", "IoT", "Arduino", "Hardware"],
                venue: "Lab 204",
                startDate: now + 4 * DAY,
                endDate: now + 5 * DAY,
                registrationDeadline: now + 2 * DAY,
                maxParticipants: 80,
                posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=cover&w=800&q=80",
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Creative UI/UX Design Sprint",
                description: "Design interactive and stunning user interfaces using Figma. Learn contrast scaling, typography, and wireframe mapping during this highly collaborative sprint.",
                category: "Design",
                tags: ["UI", "UX", "Figma", "Design"],
                venue: "Innovation Lab",
                startDate: now + 5 * DAY,
                endDate: now + 6 * DAY,
                registrationDeadline: now + 3 * DAY,
                maxParticipants: 60,
                posterUrl: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=cover&w=800&q=80",
                createdBy: users[3],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "National Coding League",
                description: "A fast-paced competitive programming contest on data structures and algorithms. Put your C++ and Python skills to the test against top university teams.",
                category: "Hackathon",
                tags: ["Coding", "Algorithms", "C++", "Python"],
                venue: "Main Computer Lab",
                startDate: now + 3 * DAY,
                endDate: now + 4 * DAY,
                registrationDeadline: now + 2 * DAY,
                maxParticipants: 150,
                posterUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=cover&w=800&q=80",
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Startup Arena: Pitch Battle",
                description: "Have a revolutionary business concept? Pitch your ideas to startup founders and mentors to secure early-stage feedback and funding packages.",
                category: "Entrepreneurship",
                tags: ["Startup", "Business", "Pitching", "Entrepreneur"],
                venue: "Seminar Hall",
                startDate: now + 6 * DAY,
                endDate: now + 7 * DAY,
                registrationDeadline: now + 4 * DAY,
                maxParticipants: 100,
                posterUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=cover&w=800&q=80",
                createdBy: users[0],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Ethical Hacking: CyberShield Labs",
                description: "Master networking, digital penetration testing, and security firewalls in our mock cyber attack-and-defend labs led by security architects.",
                category: "Workshop",
                tags: ["Cybersecurity", "Networking", "Hacking"],
                venue: "Tech Annex 101",
                startDate: now + 7 * DAY,
                endDate: now + 8 * DAY,
                registrationDeadline: now + 5 * DAY,
                maxParticipants: 75,
                posterUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=cover&w=800&q=80",
                createdBy: users[2],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Decentralized Finance Summit",
                description: "Discuss the future of blockchain, crypto assets, smart contract auditing, and global decentralized finance systems during this academic symposium.",
                category: "Business",
                tags: ["Finance", "Crypto", "Blockchain", "Business"],
                venue: "Econ Auditorium",
                startDate: now + 8 * DAY,
                endDate: now + 9 * DAY,
                registrationDeadline: now + 6 * DAY,
                maxParticipants: 120,
                posterUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=cover&w=800&q=80",
                createdBy: users[0],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Digital Painting masterclass",
                description: "Unleash your digital art potential using modern drawing tablets. Learn color theory, composition mapping, and texture rendering.",
                category: "Design",
                tags: ["Art", "Design", "Drawing", "Creative"],
                venue: "Fine Arts Studio",
                startDate: now + 9 * DAY,
                endDate: now + 10 * DAY,
                registrationDeadline: now + 7 * DAY,
                maxParticipants: 50,
                posterUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=cover&w=800&q=80",
                createdBy: users[3],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Campus Cultural Rock Night",
                description: "Experience electric live performances, bands battle, and cultural music showcases. Bring your friends and dance the night away!",
                category: "Cultural",
                tags: ["Music", "Rock", "Cultural", "Entertainment"],
                venue: "Central Amphitheatre",
                startDate: now + 10 * DAY,
                endDate: now + 11 * DAY,
                registrationDeadline: now + 8 * DAY,
                maxParticipants: 400,
                posterUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=cover&w=800&q=80",
                createdBy: users[1],
                createdAt: now,
                isArchived: false,
            },
            {
                title: "Campus Soccer Championship",
                description: "Top-tier intramural soccer championship matches. Show your support for your departments and enjoy stadium-side snacks and commentary.",
                category: "Sports",
                tags: ["Sports", "Soccer", "Athletics", "Match"],
                venue: "Sports Ground 1",
                startDate: now + 11 * DAY,
                endDate: now + 12 * DAY,
                registrationDeadline: now + 9 * DAY,
                maxParticipants: 250,
                posterUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=cover&w=800&q=80",
                createdBy: users[4],
                createdAt: now,
                isArchived: false,
            },
        ];

        for (const event of eventData) {
            const id = await ctx.db.insert("events", {
                ...event,
                registrationCount: 0,
                likeCount: 0,
                viewCount: 0,
            });
            events.push(id);
        }

        // Establish friendships
        await ctx.db.insert("friendships", { user1: users[0], user2: users[1], createdAt: now });
        await ctx.db.insert("friendships", { user1: users[0], user2: users[3], createdAt: now });
        await ctx.db.insert("friendships", { user1: users[1], user2: users[2], createdAt: now });

        // Set organizer ownerships
        await ctx.db.insert("eventOrganizers", { eventId: events[0], userId: users[2], role: "owner", addedAt: now });
        await ctx.db.insert("eventOrganizers", { eventId: events[1], userId: users[2], role: "owner", addedAt: now });
        await ctx.db.insert("eventOrganizers", { eventId: events[2], userId: users[3], role: "owner", addedAt: now });

        // Create Neural Ninjas Team for AI Hackathon
        const team1 = await ctx.db.insert("teams", {
            eventId: events[0],
            name: "Neural Ninjas",
            description: "An elite AI squad matching algorithms and code.",
            createdBy: users[0],
            maxMembers: 4,
            createdAt: now,
        });

        await ctx.db.insert("teamMembers", { teamId: team1, userId: users[0], joinedAt: now });
        await ctx.db.insert("teamMembers", { teamId: team1, userId: users[1], joinedAt: now });

        // Seed some registrations for social matching signals
        await ctx.db.insert("registrations", { eventId: events[0], userId: users[1], teamId: team1, registeredAt: now, qrToken: "QR-AI-1" });
        await ctx.db.insert("registrations", { eventId: events[1], userId: users[1], registeredAt: now, qrToken: "QR-ROBO-1" });
        await ctx.db.insert("registrations", { eventId: events[2], userId: users[3], registeredAt: now, qrToken: "QR-DESIGN-1" });

        // Update counts
        await ctx.db.patch(events[0], { registrationCount: 1, likeCount: 2, viewCount: 15 });
        await ctx.db.patch(events[1], { registrationCount: 1, likeCount: 1, viewCount: 8 });
        await ctx.db.patch(events[2], { registrationCount: 1, likeCount: 3, viewCount: 12 });

        // Seed some likes
        await ctx.db.insert("eventLikes", { eventId: events[0], userId: users[0], likedAt: now });
        await ctx.db.insert("eventLikes", { eventId: events[0], userId: users[1], likedAt: now });
        await ctx.db.insert("eventLikes", { eventId: events[2], userId: users[0], likedAt: now });
        await ctx.db.insert("eventLikes", { eventId: events[2], userId: users[3], likedAt: now });

        // Seed check-in / attendance records
        await ctx.db.insert("attendance", { eventId: events[0], userId: users[1], checkedInAt: now, qrToken: "QR-AI-1" });

        return {
            success: true,
            usersCreated: users.length,
            eventsCreated: events.length,
        };
    },
});