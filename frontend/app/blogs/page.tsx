"use client";

import { Card } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

export default function BlogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => (await _axios.get("/blogs/")).data,
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">All Notes</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Failed to load notes.</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((blog: any) => (
          <Card
            key={blog.id}
            className="p-5 flex flex-col justify-between h-full"
          >
            <div>
              <div className="font-semibold text-xl mb-2 line-clamp-2">
                {blog.title}
              </div>
              <div className="prose max-w-none mb-3 text-sm text-white">
                <ReactMarkdown>
                  {blog.content.slice(0, 300) +
                    (blog.content.length > 300 ? "..." : "")}
                </ReactMarkdown>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-2 border-t">
              <span>by {blog.author_username || "Unknown"}</span>
              <span>{new Date(blog.created_at).toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
