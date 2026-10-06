"use client";

import Link from "next/link";
import Shell from "@/components/Shell";
import { when } from "@/lib/api";
import { useResource } from "@/lib/ui";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  read: boolean;
  preview: string;
  createdAt: string;
};

export default function MessagesPage() {
  const { data, error, loading } = useResource<Message[]>("/admin/messages");
  return (
    <Shell title="Messages">
      {loading && <p className="text-sm text-muted">Loading messages...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        {(data ?? []).map((message) => (
          <Link key={message.id} href={`/messages/${message.id}`} className="block border-b border-line px-4 py-4 last:border-0 hover:bg-[#fafafa]">
            <span className="flex items-center justify-between gap-3">
              <span className={message.read ? "text-muted" : "font-medium"}>{message.name}</span>
              <span className="text-xs text-muted">{when(message.createdAt)}</span>
            </span>
            <span className="mt-1 block text-sm text-muted">{message.preview}</span>
          </Link>
        ))}
        {data && data.length === 0 && <p className="px-4 py-12 text-center text-sm text-muted">No messages yet.</p>}
      </div>
    </Shell>
  );
}
