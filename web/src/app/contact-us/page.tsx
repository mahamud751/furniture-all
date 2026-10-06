import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { getSite } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const { contact } = await getSite();
  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <h1 className="text-2xl leading-[120%] font-medium lg:text-5xl">Contact Us</h1>
        <p className="mt-3 max-w-xl text-(--secondary)">{contact.hours}.</p>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <ContactForm />
          <aside className="rounded-xl bg-white p-6 lg:p-8">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-(--primary)/40 uppercase">Service Center</h2>
            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-3 font-medium">
                  <PhoneIcon className="size-5" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 font-medium">
                  <MailIcon className="size-5" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={contact.facebook} className="flex items-center gap-3 underline">
                  <FacebookIcon className="size-5" />
                  Facebook
                </a>
              </li>
              <li>
                <a href={contact.instagram} className="flex items-center gap-3 underline">
                  <InstagramIcon className="size-5" />
                  Instagram
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
