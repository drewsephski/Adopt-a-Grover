import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface ClaimConfirmationEmailProps {
    donorName: string;
    items: {
        name: string;
        quantity: number;
        familyAlias: string;
    }[];
    dropOffAddress: string;
}

export const ClaimConfirmationEmail = ({
    donorName,
    items,
    dropOffAddress,
}: ClaimConfirmationEmailProps) => {
    const previewText = `Thank you for your donation to Adopt a Grover!`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Thank you, {donorName}!</Heading>
                    <Text style={text}>
                        We&apos;ve successfully recorded your gift claim for <strong>Adopt a Grover</strong>. Your generosity makes a real difference in our community!
                    </Text>

                    <Section style={section}>
                        <Text style={label}>YOUR CLAIMED ITEMS</Text>
                        {items.map((item, index) => (
                            <div key={index} style={itemRow}>
                                <Text style={itemText}>
                                    <strong>{item.quantity}x {item.name}</strong>
                                    <br />
                                    <span style={subText}>For {item.familyAlias}</span>
                                </Text>
                            </div>
                        ))}
                    </Section>

                    <Hr style={hr} />

                    <Section style={section}>
                        <Text style={label}>DROP-OFF INSTRUCTIONS</Text>
                        <Text style={text}>
                            Please deliver your items (unwrapped, unless specified) to our collection point.
                        </Text>
                        <div style={addressBox}>
                            <Text style={addressText}>
                                <strong>{dropOffAddress}</strong>
                                <br />
                                <span style={{ fontSize: "14px", color: "#666", marginTop: "8px", display: "block" }}>
                                    <strong>Deadline:</strong> Monday, Dec 16th
                                </span>
                            </Text>
                        </div>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        If you have any questions or need to change your claim, please reply to this email.
                        <br />
                        Together, we&apos;re making the holidays brighter for everyone in Fox River Grove.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ClaimConfirmationEmail;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    marginBottom: "64px",
    maxWidth: "580px",
    borderRadius: "12px",
    border: "1px solid #e6ebf1",
};

const h1 = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const text = {
    color: "#4a4a4a",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
};

const label = {
    color: "#8898aa",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    marginBottom: "12px",
};

const section = {
    margin: "24px 0",
};

const itemRow = {
    padding: "12px 0",
    borderBottom: "1px solid #f0f4f8",
};

const itemText = {
    margin: "0",
    fontSize: "16px",
    color: "#1a1a1a",
};

const subText = {
    fontSize: "13px",
    color: "#666",
};

const addressBox = {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #edf2f7",
    marginTop: "12px",
};

const addressText = {
    margin: "0",
    fontSize: "18px",
    color: "#1a1a1a",
    lineHeight: "1.4",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "14px",
    lineHeight: "22px",
    textAlign: "center" as const,
    marginTop: "40px",
};
