import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: January 11, 2025</p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Stupify. These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;you,&quot; &quot;your,&quot; or &quot;user&quot;) and Stupify (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of the Stupify website, application, and AI-powered question-answering service (collectively, the &quot;Service&quot;) located at stupify-brown.vercel.app.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy.</strong> If you do not agree to these Terms, you must not access or use the Service.
            </p>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Eligibility</h2>
            <p className="text-gray-700 mb-4">
              You must be at least 13 years old to use our Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You are at least 13 years of age</li>
              <li>If you are between 13 and 18, you have parental or guardian consent to use the Service</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You are not prohibited from using the Service under applicable law</li>
              <li>All information you provide is accurate, current, and complete</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To access certain features of the Service, you must create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate and complete</li>
              <li>Maintain the security and confidentiality of your password</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">3.2 Account Restrictions</h3>
            <p className="text-gray-700 mb-4">You may not:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Create an account using false or misleading information</li>
              <li>Create multiple accounts to circumvent usage limits</li>
              <li>Share your account credentials with others</li>
              <li>Transfer or sell your account to another person</li>
              <li>Use another user&apos;s account without permission</li>
            </ul>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Stupify provides an AI-powered question-answering service that explains complex topics in simple, accessible language. The Service includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>AI-generated responses to user questions at three simplicity levels</li>
              <li>Conversation history and management</li>
              <li>Free tier: 10 questions per day</li>
              <li>Premium subscription: Unlimited questions</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Important Disclaimers:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>AI-generated content may contain inaccuracies or errors</li>
              <li>Responses are for informational and educational purposes only</li>
              <li>The Service is not a substitute for professional advice (medical, legal, financial, etc.)</li>
              <li>We do not guarantee the accuracy, completeness, or timeliness of any responses</li>
            </ul>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Subscription and Payment Terms</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">5.1 Free Tier</h3>
            <p className="text-gray-700 mb-4">
              Our free tier allows 10 questions per day at no charge. The daily limit resets at midnight UTC. We reserve the right to modify free tier limits at any time with notice.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">5.2 Premium Subscription</h3>
            <p className="text-gray-700 mb-4">
              Premium subscriptions are billed monthly at $4.99/month (subject to change with notice). By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Automatic Renewal:</strong> Your subscription automatically renews each billing period until cancelled</li>
              <li><strong>Payment Authorization:</strong> You authorize us to charge your payment method for all fees</li>
              <li><strong>Payment Method:</strong> You must provide a valid payment method through Stripe</li>
              <li><strong>Price Changes:</strong> We may change subscription prices with 30 days&apos; notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">5.3 Billing and Payment Processing</h3>
            <p className="text-gray-700 mb-4">
              All payments are processed securely through Stripe. You agree to pay all fees and applicable taxes. If payment fails, we may suspend or terminate your subscription.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">5.4 Cancellation and Refunds</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings or Stripe customer portal</li>
              <li><strong>Effect of Cancellation:</strong> Upon cancellation, you retain access until the end of your current billing period</li>
              <li><strong>No Refunds:</strong> Subscription fees are non-refundable except as required by law or at our sole discretion</li>
              <li><strong>Partial Periods:</strong> No refunds or credits for partial subscription periods</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">5.5 Free Trials</h3>
            <p className="text-gray-700 mb-4">
              If we offer a free trial, you must cancel before the trial period ends to avoid being charged. Trial eligibility is at our discretion and limited to one per user.
            </p>
          </section>

          {/* Usage Restrictions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Acceptable Use Policy</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">6.1 Permitted Uses</h3>
            <p className="text-gray-700 mb-4">
              You may use the Service for lawful, personal, educational, or informational purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">6.2 Prohibited Uses</h3>
            <p className="text-gray-700 mb-4">You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Engage in harmful, fraudulent, deceptive, or misleading activities</li>
              <li>Generate or distribute illegal, harmful, or objectionable content</li>
              <li>Harass, abuse, threaten, or intimidate others</li>
              <li>Distribute spam, malware, viruses, or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Circumvent usage limits or restrictions</li>
              <li>Resell, redistribute, or commercialize the Service without authorization</li>
              <li>Generate content for illegal purposes or to cause harm</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">6.3 Content Restrictions</h3>
            <p className="text-gray-700 mb-4">You may not submit questions or content that:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Violates intellectual property rights</li>
              <li>Contains personal information of others without consent</li>
              <li>Is defamatory, obscene, pornographic, or offensive</li>
              <li>Promotes violence, terrorism, or illegal activities</li>
              <li>Violates privacy or confidentiality obligations</li>
            </ul>
          </section>

          {/* User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">7. User-Generated Content</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.1 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of questions, prompts, and content you submit to the Service (&quot;User Content&quot;). However, by submitting User Content, you grant us:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>A worldwide, non-exclusive, royalty-free license to use, store, and process your User Content</li>
              <li>The right to use your User Content to provide, improve, and develop the Service</li>
              <li>The right to use aggregated, anonymized data for analytics and service improvement</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.2 AI-Generated Content</h3>
            <p className="text-gray-700 mb-4">
              Responses generated by our AI are provided to you for your personal use. You may save, copy, and use AI-generated responses, but you acknowledge that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>AI-generated content may be similar to content generated for other users</li>
              <li>We do not claim ownership of AI-generated responses</li>
              <li>You are responsible for verifying accuracy before relying on or distributing AI responses</li>
              <li>You must comply with applicable laws when using AI-generated content</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">7.3 Feedback</h3>
            <p className="text-gray-700 mb-4">
              If you provide feedback, suggestions, or ideas about the Service, we may use them without any obligation to compensate you.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content (excluding User Content), features, and functionality are owned by Stupify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              Our trademarks, logos, and service marks (&quot;Marks&quot;) may not be used without our prior written consent. All other trademarks are the property of their respective owners.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">9. Third-Party Services and Links</h2>
            <p className="text-gray-700 mb-4">
              Our Service uses third-party services including OpenAI, Stripe, and Supabase. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Third-party services, content, or practices</li>
              <li>Any damages or losses caused by third-party services</li>
              <li>Changes to or discontinuation of third-party services</li>
            </ul>
            <p className="text-gray-700 mb-4">
              The Service may contain links to third-party websites. We do not endorse or assume responsibility for third-party content or websites.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">10. Disclaimers</h2>
            <p className="text-gray-700 mb-4">
              <strong>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
            </p>
            <p className="text-gray-700 mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES REGARDING ACCURACY, RELIABILITY, OR AVAILABILITY OF THE SERVICE</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
              <li>WARRANTIES REGARDING AI-GENERATED CONTENT ACCURACY OR COMPLETENESS</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Not Professional Advice:</strong> The Service is for informational purposes only and does not constitute professional advice. You should not rely on AI-generated responses for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Medical, health, or mental health advice or diagnosis</li>
              <li>Legal advice or interpretation</li>
              <li>Financial, investment, or tax advice</li>
              <li>Professional consultations of any kind</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Always seek professional advice from qualified professionals for important decisions.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">11. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, STUPIFY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
              <li>BUSINESS INTERRUPTION OR LOST BUSINESS OPPORTUNITIES</li>
              <li>PERSONAL INJURY OR PROPERTY DAMAGE</li>
              <li>RELIANCE ON AI-GENERATED CONTENT</li>
              <li>UNAUTHORIZED ACCESS TO YOUR DATA</li>
            </ul>
            <p className="text-gray-700 mb-4">
              WHETHER ARISING FROM CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.</strong>
            </p>
            <p className="text-gray-700 mb-4">
              Some jurisdictions do not allow limitation of liability for certain damages, so some limitations may not apply to you.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">12. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless Stupify and its affiliates, officers, directors, employees, agents, and licensors from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys&apos; fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">13. Termination</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">13.1 Termination by You</h3>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Using the account deletion feature in your settings</li>
              <li>Contacting us at support@stupify.app</li>
              <li>Canceling your subscription through Stripe</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">13.2 Termination by Us</h3>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your access to the Service immediately, without notice, for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion for any reason</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">13.3 Effect of Termination</h3>
            <p className="text-gray-700 mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your right to access the Service immediately ceases</li>
              <li>We may delete your account data after 30 days</li>
              <li>You remain liable for all fees incurred before termination</li>
              <li>Sections that by their nature should survive termination shall survive</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">14. Dispute Resolution and Arbitration</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">14.1 Informal Resolution</h3>
            <p className="text-gray-700 mb-4">
              Before filing a claim, you agree to contact us at support@stupify.app to attempt to resolve the dispute informally. We will attempt to resolve the dispute within 60 days.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">14.2 Binding Arbitration</h3>
            <p className="text-gray-700 mb-4">
              If we cannot resolve the dispute informally, any dispute arising from these Terms or the Service shall be resolved through binding arbitration, except:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Claims in small claims court</li>
              <li>Claims for injunctive or equitable relief</li>
              <li>Intellectual property disputes</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">14.3 Class Action Waiver</h3>
            <p className="text-gray-700 mb-4">
              <strong>YOU AND STUPIFY AGREE THAT DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.</strong>
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">15. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to conflict of law provisions.
            </p>
            <p className="text-gray-700 mb-4">
              You agree to submit to the personal and exclusive jurisdiction of the courts located in [Your Jurisdiction] for resolution of any disputes not subject to arbitration.
            </p>
          </section>

          {/* Miscellaneous */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">16. Miscellaneous Provisions</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.1 Entire Agreement</h3>
            <p className="text-gray-700 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Stupify regarding the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.2 Severability</h3>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.3 Waiver</h3>
            <p className="text-gray-700 mb-4">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.4 Assignment</h3>
            <p className="text-gray-700 mb-4">
              You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.5 Force Majeure</h3>
            <p className="text-gray-700 mb-4">
              We shall not be liable for any failure to perform due to circumstances beyond our reasonable control.
            </p>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">16.6 Notices</h3>
            <p className="text-gray-700 mb-4">
              We may provide notices to you via email or through the Service. You agree that electronic notices satisfy any legal communication requirements.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">17. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> support@stupify.app</p>
              <p className="text-gray-700 mb-2"><strong>Support:</strong> support@stupify.app</p>
              <p className="text-gray-700"><strong>Website:</strong> https://stupify.app</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">18. Acknowledgment</h2>
            <p className="text-gray-700 mb-4">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
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
