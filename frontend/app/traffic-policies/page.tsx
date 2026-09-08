"use client";

import Layout from "@/components/Layout";

export default function TrafficPoliciesPage() {
    return (
        <Layout>
            <style>{`
                .cs-container {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    min-height: 400px; text-align: center;
                }
                .cs-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #0f1111; }
                .cs-desc { font-size: 14px; color: #555; max-width: 500px; line-height: 1.5; margin-bottom: 24px; }
                .cs-btn {
                    background: #ff9900; border: 1px solid #e47911; border-radius: 20px;
                    padding: 8px 20px; font-size: 14px; font-weight: 700; color: #0f1111; cursor: pointer;
                }
                .cs-btn:hover { background: #ec8800; }
            `}</style>

            <div className="cs-container">
                <div className="cs-title">Traffic policies</div>
                <div className="cs-desc">
                    Amazon Route 53 traffic flow provides a visual tool that lets you easily create policies for multiple endpoints in complex configurations.
                    <br /><br />
                    <em>This feature is coming soon in the Route 53 Clone.</em>
                </div>
                <button className="cs-btn">Create traffic policy</button>
            </div>
        </Layout>
    );
}
