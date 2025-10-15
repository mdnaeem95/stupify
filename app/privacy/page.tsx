import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Stupify</span>
            </Link>
            <Link href="/">
              <Button variant="ghost">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 11, 2025</p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Stupify (`&quot;`we,`&quot;` `&quot;`our,`&quot;` or `&quot;`us`&quot;`). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered question-answering service at stupify-brown.vercel.app (the &quot;Service&quot;).
            </p>
            <p className="text-gray-700 mb-4">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">2.1 Information You Provide to Us</h3>
            <p className="text-gray-700 mb-4">We collect information that you voluntarily provide when using our Service:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Information:</strong> Email address, password (encrypted), and optionally your full name</li>
              <li><strong>Payment Information:</strong> Billing information processed securely through Stripe (we do not store credit card details)</li>
              <li><strong>Communication Data:</strong> Your questions, prompts, and any other content you submit to our AI service</li>
              <li><strong>Correspondence:</strong> Information in messages you send to us (support emails, feedback, etc.)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">2.2 Information Collected Automatically</h3>
            <p className="text-gray-700 mb-4">When you access our Service, we automatically collect certain information:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Usage Data:</strong> Number of questions asked, simplicity level preferences, conversation history, timestamps</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URLs</li>
              <li><strong>Cookies and Tracking:</strong> Authentication tokens, session identifiers, and preference settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">2.3 Information from Third Parties</h3>
            <p className="text-gray-700 mb-4">We may receive information from:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Stripe:</strong> Payment processing status, subscription information, billing details</li>
              <li><strong>Analytics Providers:</strong> Aggregated usage statistics and performance metrics</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Provide the Service:</strong> Process your questions through AI, generate responses, manage your account</li>
              <li><strong>Improve Our Service:</strong> Analyze usage patterns, train and improve our AI models, fix bugs</li>
              <li><strong>Process Payments:</strong> Handle subscriptions, billing, and payment processing through Stripe</li>
              <li><strong>Communicate:</strong> Send service updates, respond to inquiries, provide customer support</li>
              <li><strong>Enforce Usage Limits:</strong> Track daily question limits for free tier users</li>
              <li><strong>Security:</strong> Detect fraud, prevent abuse, protect against security threats</li>
              <li><strong>Compliance:</strong> Comply with legal obligations and enforce our Terms of Service</li>
              <li><strong>Analytics:</strong> Understand how users interact with our Service to improve features</li>
            </ul>
          </section>

          {/* AI and Data Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. AI Processing and Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">4.1 OpenAI Integration</h3>
            <p className="text-gray-700 mb-4">
              We use OpenAI`&apos;`s API to process your questions and generate responses. Your questions and our AI responses are transmitted to OpenAI for processing. OpenAI`&apos;`s use of your data is governed by their own privacy policy and data usage policies. OpenAI may use your data to improve their models unless you opt out through their API settings.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Do not submit sensitive personal information, confidential business information, or any data you wish to keep private in your questions.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">4.2 Other Third-Party Services</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Supabase:</strong> Database hosting and authentication services (EU/US data centers)</li>
              <li><strong>Stripe:</strong> Payment processing (PCI DSS compliant)</li>
              <li><strong>Vercel:</strong> Application hosting and content delivery</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Data Retention</h2>
            <p className="text-gray-700 mb-4">We retain your information for as long as necessary to provide the Service and comply with legal obligations:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Data:</strong> Retained until you delete your account, plus 30 days for backup purposes</li>
              <li><strong>Conversation History:</strong> Retained while your account is active; deleted when you delete your account</li>
              <li><strong>Payment Records:</strong> Retained for 7 years to comply with tax and financial regulations</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days for security and service improvement purposes</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. How We Share Your Information</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Service Providers:</strong> With third parties who perform services on our behalf (OpenAI, Stripe, Supabase, Vercel)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or part of our business</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, safety, or that of our users or the public</li>
              <li><strong>With Your Consent:</strong> When you explicitly consent to sharing</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Your Privacy Rights</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.1 General Rights</h3>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.2 GDPR Rights (European Users)</h3>
            <p className="text-gray-700 mb-4">
              If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with your local supervisory authority</li>
              <li>Right to object to automated decision-making</li>
              <li>Legal basis for processing: Consent, contract performance, legitimate interests</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.3 CCPA Rights (California Users)</h3>
            <p className="text-gray-700 mb-4">
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know whether personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information (we do not sell data)</li>
              <li>Right to access your personal information</li>
              <li>Right to equal service and price, even if you exercise your privacy rights</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.4 How to Exercise Your Rights</h3>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, please contact us at: <strong>support@stupify.app</strong> (or your contact email)
            </p>
            <p className="text-gray-700 mb-4">
              We will respond to your request within 30 days. To delete your account, you can also use the account deletion feature in your account settings.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
              <li><strong>Secure Infrastructure:</strong> Hosting on secure, compliant platforms (Vercel, Supabase)</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
              <li><strong>Password Security:</strong> Passwords are hashed using industry-standard algorithms</li>
            </ul>
            <p className="text-gray-700 mb-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and service functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how users interact with our Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our Service.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Children`&apos;`s Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at support@stupify.app, and we will delete such information from our systems.
            </p>
            <p className="text-gray-700 mb-4">
              For users between 13 and 18 years of age, we recommend parental guidance when using our Service.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">11. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have data protection laws that are different from the laws of your country.
            </p>
            <p className="text-gray-700 mb-4">
              We ensure appropriate safeguards are in place for international data transfers, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions where applicable</li>
              <li>Compliance with applicable data protection frameworks</li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Do Not Track Signals</h2>
            <p className="text-gray-700 mb-4">
              Some browsers have a `&quot;`Do Not Track`&quot;` feature that lets you tell websites you do not want to have your online activities tracked. We do not currently respond to Do Not Track signals.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">13. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Posting the updated Privacy Policy on this page</li>
              <li>Updating the `&quot;`Last Updated`&quot;` date</li>
              <li>Sending you an email notification (for material changes)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your continued use of the Service after any changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> support@stupify.app</p>
              <p className="text-gray-700 mb-2"><strong>Website:</strong> https://stupify.app</p>
              <p className="text-gray-700"><strong>Response Time:</strong> We will respond to your inquiry within 30 days</p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">15. Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              If you have concerns about our privacy practices that we cannot resolve directly, you have the right to lodge a complaint with your local data protection authority or supervisory authority.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">16. Acknowledgment</h2>
            <p className="text-gray-700 mb-4">
              By using our Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}