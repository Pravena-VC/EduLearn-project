"use client";

import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function BlogDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => (await _axios.get(`/blogs/${id}/`)).data,
    enabled: !!id,
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href="/dashboard/candidate/blogs"
        className="text-blue-600 underline mb-4 inline-block"
      >
        ← Back to My Notes
      </Link>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Failed to load blog.</div>}
      {data && (
        <>
          <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
          <div className="text-xs text-gray-500 mb-4">
            by {data.author_username} •{" "}
            {new Date(data.created_at).toLocaleString()}
          </div>
          <div
            className="border rounded p-4 bg-white text-black overflow-x-auto"
            style={{ fontFamily: "inherit" }}
          >
            <ReactMarkdown
              components={{
                pre: ({ node, ...props }) => (
                  <pre
                    style={{
                      background: "#222",
                      color: "#fff",
                      padding: "1em",
                      borderRadius: 6,
                      overflowX: "auto",
                    }}
                    {...props}
                  />
                ),
                code: ({ node, ...props }) => (
                  <code
                    style={{
                      background: "#eee",
                      color: "#d6336c",
                      padding: "2px 4px",
                      borderRadius: 4,
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {data.content}
            </ReactMarkdown>
          </div>
        </>
      )}
      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Other Blogs</h2>
        {/* Blog section: could fetch and render other blogs here if needed */}
      </div>
    </div>
  );
}
