import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | HH GOA",
  description: "Terms & Conditions for Hacker House Goa 2026.",
};

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "eligibility", label: "Eligibility & Registration" },
  { id: "selection", label: "The Selection Process" },
  { id: "rsvp-stake", label: "RSVP, Stake & Cancellations" },
  { id: "conduct", label: "Code of Conduct" },
  { id: "ip", label: "Intellectual Property" },
  { id: "media", label: "Media & Publicity" },
  { id: "safety", label: "Health, Safety & Travel" },
  { id: "partners", label: "Sponsor & Partner Interactions" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "law", label: "Governing Law" },
  { id: "contact", label: "Contact" },
] as const;

function Section({
  n,
  id,
  title,
  children,
}: {
  n: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-black/10 pt-8">
      <h2 className="font-heading font-bold text-brand-primary text-[26px] sm:text-[30px] leading-tight mb-4">
        <span className="text-brand-pink mr-3 tabular-nums">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="font-body text-black/80 text-[15px] leading-[1.75] max-w-[68ch] flex flex-col gap-4">
        {children}
      </div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-accent/20 border-l-4 border-brand-pink px-5 py-4 rounded-r-md">
      <p className="font-body text-black text-[14.5px] leading-relaxed">{children}</p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      <header className="sticky top-0 z-10 bg-brand-primary text-brand-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <span className="font-heading font-bold uppercase tracking-wide text-[15px]">
            HH GOA <span className="text-brand-accent">·</span> Terms
          </span>
          <Link
            href="/"
            className="font-body text-[13px] uppercase tracking-wide text-brand-offwhite/90 hover:text-brand-accent transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        <div className="mb-14">
          <p className="font-heading font-extrabold uppercase tracking-[0.1em] text-brand-pink text-[14px] mb-3">
            Legal
          </p>
          <h1 className="font-heading font-bold uppercase text-brand-primary text-[44px] sm:text-[56px] leading-[1.02] mb-4 text-wrap-balance">
            Terms &amp; Conditions
          </h1>
          <p className="font-body text-black/70 text-[14.5px] leading-relaxed max-w-[60ch]">
            Effective 2 August 2026. These terms govern registration, selection, and participation
            in Hacker House Goa 2026 — a 4-day experimental hackathon residency in Goa, India,
            28–31 October 2026. By registering for Open Trials or any later stage, you agree to
            the terms below.
          </p>
        </div>

        <nav aria-label="Table of contents" className="mb-16 border border-black/10 rounded-lg bg-white/40 p-6 sm:p-7">
          <p className="font-heading font-bold uppercase text-brand-primary text-[13px] tracking-[0.08em] mb-4">
            On this page
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="font-body text-[14px] text-black/75 hover:text-brand-pink transition-colors flex gap-2.5"
                >
                  <span className="text-brand-pink tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-12">
          <Section n={1} id="acceptance" title="Acceptance of Terms">
            <p>
              Hacker House Goa (&ldquo;HH GOA,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is organized by 2:47 PM Studio.
              Registering for any stage of HH GOA 2026 — Open Trials, a Selections round, Partner
              Trials, or RSVP — means you accept these terms in full. If you don&rsquo;t agree, please
              don&rsquo;t register.
            </p>
          </Section>

          <Section n={2} id="eligibility" title="Eligibility & Registration">
            <p>
              Open Trials are open to everyone — students, professionals, and independent builders,
              anywhere in the world. You must be at least 18 years old at the time of the Residency,
              or have written consent from a parent/guardian plus an accompanying adult.
            </p>
            <p>
              Each stage in the selection funnel narrows the applicant pool. Advancing from one stage
              doesn&rsquo;t guarantee advancement through the next — HH GOA and its partners make
              selection decisions at their sole discretion, based on the criteria published for that
              stage.
            </p>
          </Section>

          <Section n={3} id="selection" title="The Selection Process">
            <p>HH GOA 2026 runs a five-stage funnel before the Residency itself:</p>
            <ul className="list-none flex flex-col gap-2">
              {[
                ["Open Trials", "August 2026 — skill-based challenges, open to everyone."],
                ["Alpha → Delta Selections", "Sept 2026 — sequential shortlisting: performance review, technical deep-dive, and team-fit interviews."],
                ["Partner Trials", "September 2026 — matched against partner-specific requirements and interests."],
                ["RSVP & Stake", "Late September — final confirmation of your team's participation."],
                ["Residency", "28–31 Oct 2026 — 247 builders on-site in Goa."],
              ].map(([name, desc]) => (
                <li key={name} className="flex gap-3">
                  <span className="font-heading font-bold text-brand-primary shrink-0">{name}</span>
                  <span className="text-black/70">— {desc}</span>
                </li>
              ))}
            </ul>
            <p>
              Full dates and criteria for the current cycle are posted on the{" "}
              <Link href="/#timeline" className="text-brand-pink underline underline-offset-2">
                Timeline at a Glance
              </Link>{" "}
              section of the homepage, which supersedes any older schedule referenced elsewhere.
            </p>
          </Section>

          <Section n={4} id="rsvp-stake" title="RSVP, Stake & Cancellations">
            <p>
              Once your team clears Partner Trials, confirming your spot requires an RSVP and a
              refundable stake. The stake exists to hold a seat that would otherwise go to a
              waitlisted team — it is not a fee for participation.
            </p>
            <Callout>
              Your stake is refunded in full if HH GOA cancels or reschedules the Residency, or if
              you withdraw at least 14 days before 28 October 2026. Stakes are forfeited for
              no-shows or withdrawals inside that 14-day window, since a seat can no longer be
              reassigned at that point.
            </Callout>
            <p>
              Refunds are processed to the original payment method within 10 business days of
              approval. Contact us (see Contact, below) to request a withdrawal or refund.
            </p>
          </Section>

          <Section n={5} id="conduct" title="Code of Conduct">
            <p>
              HH GOA is a harassment-free environment for everyone, regardless of gender, gender
              identity, sexual orientation, disability, physical appearance, body size, race, or
              religion. We don&rsquo;t tolerate harassment of participants, mentors, staff, or partners
              in any form.
            </p>
            <Callout>
              Violations may result in immediate removal from the Residency without refund of any
              stake, and exclusion from future HH GOA events. Report concerns to any on-site
              organizer or via the contact below — reports are handled confidentially.
            </Callout>
          </Section>

          <Section n={6} id="ip" title="Intellectual Property">
            <p>
              You and your team retain full ownership of what you build during the Residency.
              Anything you bring with you — prior code, designs, or datasets — stays yours; you&rsquo;re
              responsible for having the rights to use it.
            </p>
            <p>
              By participating, you grant HH GOA a non-exclusive, royalty-free license to showcase
              your project (name, description, screenshots, demo links) in recaps, the website, and
              future promotional material. Bounty-specific IP terms, if any, are set by the
              sponsoring partner and disclosed before you opt in.
            </p>
          </Section>

          <Section n={7} id="media" title="Media & Publicity">
            <p>
              Photos and video are captured throughout the Residency for aftermovies, recaps, and
              future promotion. By attending, you consent to being filmed or photographed in shared
              spaces, and to that footage being used by HH GOA and 2:47 PM Studio without
              compensation. Let an organizer know on arrival if you&rsquo;d like to opt out, and we&rsquo;ll do
              our best to keep you out of published shots.
            </p>
          </Section>

          <Section n={8} id="safety" title="Health, Safety & Travel">
            <p>
              You&rsquo;re responsible for your own travel arrangements, visas, travel insurance, and any
              medical needs during your stay in Goa. HH GOA provides the venue, meals during
              programming hours, and reasonable on-site duty of care, but isn&rsquo;t a substitute for
              personal insurance.
            </p>
            <p>
              Follow venue safety guidance and local law at all times. HH GOA reserves the right to
              remove any participant whose conduct puts themselves or others at risk.
            </p>
          </Section>

          <Section n={9} id="partners" title="Sponsor & Partner Interactions">
            <p>
              Partner Trials, bounties, and workshops may carry additional terms set by the
              sponsoring organization (for example, eligibility for a specific bounty prize, or
              usage terms for a partner API/SDK). Where partner terms and these Terms conflict on a
              partner-specific matter, the partner&rsquo;s published terms govern that matter only.
            </p>
          </Section>

          <Section n={10} id="liability" title="Limitation of Liability">
            <p>
              To the fullest extent permitted by law, HH GOA, 2:47 PM Studio, and their organizers
              aren&rsquo;t liable for indirect, incidental, or consequential damages arising from your
              participation, including loss of personal property, travel disruption, or project
              data loss. Nothing here limits liability for death, personal injury, or fraud caused
              by our negligence.
            </p>
          </Section>

          <Section n={11} id="changes" title="Changes to These Terms">
            <p>
              We may update these Terms as the event details firm up — most recently for the 2026
              selection funnel. Material changes will be reflected by a new effective date at the
              top of this page. Continued participation after a change means you accept the revised
              terms.
            </p>
          </Section>

          <Section n={12} id="law" title="Governing Law">
            <p>
              These Terms are governed by the laws of India. Any dispute arising from HH GOA 2026
              is subject to the exclusive jurisdiction of the courts of Goa, India.
            </p>
          </Section>

          <Section n={13} id="contact" title="Contact">
            <p>
              Questions about these Terms, your stake, or a withdrawal request — reach us at{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=satapathyprayasu@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-pink underline underline-offset-2"
              >
                satapathyprayasu@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <footer className="bg-brand-primary text-brand-offwhite/80">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-body text-[13px]">© 2026 HH-Goa. All rights reserved.</p>
          <Link href="/" className="font-body text-[13px] hover:text-brand-accent transition-colors">
            ← Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
