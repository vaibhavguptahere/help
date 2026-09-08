"use client";

import Layout from "@/components/Layout";

export default function ResolverPage() {
    return (
        <Layout>
            <style>{`
                .cs-container {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    min-height: 400px; text-align: center;
                }
                .cs-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #0f1111; }
                .cs-desc { font-size: 14px; color: #555; max-width: 500px; line-height: 1.5; margin-bottom: 24px; }
            `}</style>

            <div className="cs-container">
                <div className="cs-title">Route 53 Resolver</div>
                <div className="cs-desc">
                    Route 53 Resolver responds recursively to DNS queries from AWS resources for public records, Amazon VPC-specific DNS names, and Amazon Route 53 private hosted zones.
                    <br /><br />
                    <em>This feature is coming soon in the Route 53 Clone.</em>
                </div>
            </div>
        </Layout>
    );
}
