"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { api, when } from "@/lib/api";
import { btnDanger, btnGhost, useResource } from "@/lib/ui";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
};

export default function MessagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, error } = useResource<Message>(`/admin/messages/${params.id}`);
  return (
    <Shell title="Message" action={<Link href="/messages" className={btnGhost}>All messages</Link>}>
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && (
        <article className="max-w-3xl rounded-xl bg-white p-6 ring-1 ring-black/5">
          <p className="text-xs text-muted">{when(data.createdAt)} · {data.subject}</p>
          <h2 className="mt-2 text-2xl font-medium">{data.name}</h2>
          <p className="mt-2 text-sm text-muted">{data.phone} · {data.email}</p>
          <p className="mt-6 text-sm leading-7 whitespace-pre-wrap">{data.body}</p>
          <div className="mt-6 flex gap-2">
            <a className={btnGhost} href={`mailto:${data.email}`}>Reply by email</a>
            <button
              className={btnDanger}
              onClick={async () => {
                if (!confirm("Delete this message?")) return;
                await api(`/admin/messages/${data.id}`, { method: "DELETE" });
                router.replace("/messages");
              }}
            >
              Delete
            </button>
          </div>
        </article>
      )}
    </Shell>
  );
}
