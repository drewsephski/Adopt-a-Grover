export interface ArchiveClaim {
    donor: string;
    comment: string;
}

export interface ArchiveMember {
    relation: string;
    claims: ArchiveClaim[];
}

export interface ArchiveFamily {
    alias: string;
    members: ArchiveMember[];
}

export interface ArchiveCampaign {
    year: string;
    name: string;
    families: ArchiveFamily[];
}

export const PAST_EVENTS: ArchiveCampaign[] = [
    {
        year: "2025",
        name: "2025 Christmas Campaign",
        families: [
            {
                alias: "Family A",
                members: [
                    { relation: "Mom", claims: [{ donor: "Ashley Waxler", comment: "I’ll get everything." }] },
                    { relation: "Dad", claims: [{ donor: "Ashley Waxler", comment: "I’ll get everything." }] },
                    { relation: "Boy (12)", claims: [{ donor: "Ashley Waxler", comment: "I’ll get everything." }] },
                    { relation: "Girl (7)", claims: [{ donor: "Katie Gleason", comment: "doll + coloring books" }, { donor: "Kim Scherzer", comment: "rest" }] },
                ]
            },
            {
                alias: "Family B",
                members: [
                    { relation: "Boy (13)", claims: [{ donor: "Christie Morgan", comment: "Will buy all for him." }] }
                ]
            },
            {
                alias: "Family C",
                members: [
                    {
                        relation: "Mom",
                        claims: [
                            { donor: "Katrina McLaughlin", comment: "kitchen towels, hat, gloves, socks" },
                            { donor: "Deb Janssen", comment: "blanket, sweatshirt" },
                            { donor: "Miki Gale", comment: "silverware, fruit basket" },
                            { donor: "Angela Nollett", comment: "PJs" },
                            { donor: "Laurie Salvano", comment: "sweater" }
                        ]
                    },
                    {
                        relation: "Girl (14)",
                        claims: [
                            { donor: "Beth Voyles", comment: "stuffed animal, hair clips, art supplies, shirt" },
                            { donor: "Deb Janssen", comment: "boots, mittens, winter coat, hat" },
                            { donor: "Cindy Estep", comment: "sweatshirt & sweater" },
                            { donor: "Dawn Richter-Yok…", comment: "everything remaining" }
                        ]
                    }
                ]
            },
            {
                alias: "Family D",
                members: [
                    { relation: "Girl (8)", claims: [{ donor: "Emily Garner", comment: "Will get all." }] },
                    {
                        relation: "Girl (10)",
                        claims: [
                            { donor: "Katie Gleason", comment: "art supplies" },
                            { donor: "Michell Dehnert", comment: "rest of list" }
                        ]
                    },
                    {
                        relation: "Boy (5)",
                        claims: [
                            { donor: "Margaret Beiswen…", comment: "K‑pop T‑shirt + nerf gun" },
                            { donor: "Brian Wall", comment: "rest" }
                        ]
                    }
                ]
            },
            {
                alias: "Family E",
                members: [
                    { relation: "Mom", claims: [{ donor: "Natalie WOODS", comment: "all items" }] },
                    { relation: "Dad", claims: [{ donor: "Natalie WOODS", comment: "all items" }] },
                    { relation: "Boy (15)", claims: [{ donor: "Natalie WOODS", comment: "all items" }] },
                    { relation: "Boy (6)", claims: [{ donor: "Natalie WOODS", comment: "all items" }] },
                    { relation: "Boy (6)", claims: [{ donor: "Natalie WOODS", comment: "all items" }] }
                ]
            },
            {
                alias: "Family F",
                members: [
                    { relation: "Mom", claims: [{ donor: "Amy Bunton", comment: "Will get all." }] },
                    {
                        relation: "Girl (12)",
                        claims: [
                            { donor: "Lynette Etter", comment: "PJs & socks" },
                            { donor: "Rosa Saludo", comment: "board games, face/hand cream, cosmetics" },
                            { donor: "Rachel Rymsza", comment: "everything else" }
                        ]
                    },
                    {
                        relation: "Girl (7)",
                        claims: [
                            { donor: "Katie Gleason", comment: "ornaments + T‑shirts" },
                            { donor: "Emily Narkviroj", comment: "remaining items" }
                        ]
                    }
                ]
            },
            {
                alias: "Family G",
                members: [
                    { relation: "Mom", claims: [{ donor: "Kim Scherzer", comment: "Will get all." }] },
                    {
                        relation: "Boy (13)",
                        claims: [
                            { donor: "Deb Janssen", comment: "socks, winter hat, soccer ball" },
                            { donor: "Rachel Rymsza", comment: "everything else" }
                        ]
                    },
                    {
                        relation: "Girl (10)",
                        claims: [
                            { donor: "Lynette Etter", comment: "journal & pencil pouch" },
                            { donor: "Margaret Beiswen…", comment: "baby doll, baby clothes, stroller" },
                            { donor: "Rachel Rymsza", comment: "everything else" }
                        ]
                    },
                    { relation: "Girl (7)", claims: [{ donor: "Margaret Beiswen…", comment: "Will buy all." }] }
                ]
            },
            {
                alias: "Family H",
                members: [
                    { relation: "Mom", claims: [{ donor: "Kathy Phelan", comment: "Will get all." }] },
                    {
                        relation: "Boy (9)",
                        claims: [
                            { donor: "Vicki Bawinkel", comment: "stainless steel water bottle" },
                            { donor: "Jen Arendt", comment: "socks, PJs, sweatshirt, pants, Pokémon cards" }
                        ]
                    },
                    {
                        relation: "Boy (10)",
                        claims: [
                            { donor: "Lynette Etter", comment: "stainless steel water bottle" },
                            { donor: "Rachel Rymsza", comment: "everything else" }
                        ]
                    }
                ]
            },
            {
                alias: "Family I",
                members: [
                    { relation: "Mom", claims: [{ donor: "Seana Barnett", comment: "Will get all the items." }] },
                    { relation: "Girl (8)", claims: [{ donor: "Emily Garner", comment: "Will get all." }] },
                    { relation: "Boy (3)", claims: [{ donor: "Jamie Dimmick", comment: "Will get all items." }] }
                ]
            },
            {
                alias: "Family J",
                members: [
                    {
                        relation: "Boy (13)",
                        claims: [
                            { donor: "Lynette Etter", comment: "chess set" },
                            { donor: "Joanna Colletti", comment: "rest" }
                        ]
                    },
                    {
                        relation: "Boy (7)",
                        claims: [
                            { donor: "Lynette Etter", comment: "flannel twin sheets" },
                            { donor: "Carly Bo‑Hansen", comment: "rest" }
                        ]
                    },
                    { relation: "Boy (4)", claims: [{ donor: "Kirsten Wall", comment: "all items." }] }
                ]
            },
            {
                alias: "Family K",
                members: [
                    {
                        relation: "Girl (5)",
                        claims: [
                            { donor: "Stacy Oppegard", comment: "outfits and craft kits" },
                            { donor: "Jessica Troxell", comment: "drawing pad/set, makeup, pants, shirts" },
                            { donor: "FRG PTO", comment: "rest" }
                        ]
                    }
                ]
            },
            {
                alias: "Family L",
                members: [
                    {
                        relation: "Mom",
                        claims: [
                            { donor: "Maddie Funderburk", comment: "air fryer, PJs, socks" },
                            { donor: "Katie Coleman", comment: "rest" }
                        ]
                    },
                    { relation: "Boy (16)", claims: [{ donor: "Mallory Rico", comment: "ALL and more." }] },
                    {
                        relation: "Boy (17)",
                        claims: [
                            { donor: "Vicki Bawinkel", comment: "deodorant, duffle bag, Dove shampoo/conditioner" },
                            { donor: "Kerry Krause", comment: "socks, PJs, XXL sweatshirt + LEGO set" },
                            { donor: "Krystie Lee", comment: "sweatpants, tennis shoes" }
                        ]
                    },
                    { relation: "Boy (13)", claims: [{ donor: "Kim Scherzer", comment: "Will buy all." }] },
                    {
                        relation: "Boy (10)",
                        claims: [
                            { donor: "Kathi Woitas", comment: "drawing books, pencils, board game, Roblox gift card" },
                            { donor: "FRG PTO", comment: "rest" }
                        ]
                    }
                ]
            },
            {
                alias: "Family M",
                members: [
                    {
                        relation: "Boy (8)",
                        claims: [
                            { donor: "Vicki Bawinkel", comment: "nerf gun" },
                            { donor: "Sarah Monroe", comment: "rest" }
                        ]
                    },
                    {
                        relation: "Boy (7)",
                        claims: [
                            { donor: "Vicki Bawinkel", comment: "nerf gun" },
                            { donor: "Lindsay Golich", comment: "rest" }
                        ]
                    }
                ]
            }
        ]
    }
];
