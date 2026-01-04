import { getActiveCampaign } from "@/lib/actions/campaign";
import PublicLayout from "@/components/donor/public-layout";
import { FamilyGrid } from "@/components/donor/family-grid";
import { HeroSection } from "@/components/donor/hero-section";
import { Gift, Heart, Info, CheckCircle } from "lucide-react";

export default async function Page() {
    const activeCampaign = await getActiveCampaign();

    return (
        <PublicLayout>
            <div className="space-y-24 pb-32">
                {/* Hero */}
                <HeroSection campaignName={activeCampaign?.name} />

                {/* Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {!activeCampaign ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-3xl border border-border shadow-sm px-8">
                            <div className="p-4 rounded-2xl bg-secondary mb-6">
                                <Info className="h-10 w-10 text-secondary-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold text-card-foreground mb-2">No active campaign yet</h2>
                            <p className="text-muted-foreground max-w-md">
                                We&apos;re currently preparing for our next donation season. Please check back soon or follow our community updates.
                            </p>
                        </div>
                    ) : activeCampaign.status === "CLOSED" ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-card rounded-3xl border border-border shadow-sm px-8">
                            <div className="p-4 rounded-2xl bg-secondary mb-6">
                                <CheckCircle className="h-10 w-10 text-secondary-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold text-card-foreground mb-2">Donations are closed</h2>
                            <p className="text-muted-foreground max-w-md">
                                The &quot;{activeCampaign.name}&quot; campaign has reached its conclusion. Thank you to everyone who participated!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {/* Guidance Row */}
                            <div className="relative">
                                {/* Top right gradient to blend with hero section */}
                                <div className="absolute top-[-10%] left-[-50%] w-[50%] h-[50%] bg-accent/50 rounded-full blur-[100px]" />

                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <InfoCard
                                        icon={<Gift className="h-6 w-6 text-primary" />}
                                        title="Choose a gift"
                                        description="Browse families and select items they need for the holiday season."
                                    />
                                    <InfoCard
                                        icon={<Heart className="h-6 w-6 text-primary" />}
                                        title="Claim it"
                                        description="Provide your name and email. We&apos;ll send you the details for your donation."
                                    />
                                    <InfoCard
                                        icon={<CheckCircle className="h-6 w-6 text-primary" />}
                                        title="Drop it off"
                                        description="Deliver your items to our designated collection point in Fox River Grove."
                                    />
                                </div>
                            </div>

                            {/* Family Grid */}
                            <div id="browse" className="scroll-mt-32 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight">Browse Families</h2>
                                        <p className="text-muted-foreground">Choose a family to support this season.</p>
                                    </div>
                                </div>

                                <FamilyGrid campaign={activeCampaign} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

function InfoCard({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="mb-4 inline-block">{icon}</div>
            <h3 className="text-lg font-bold text-card-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    );
}