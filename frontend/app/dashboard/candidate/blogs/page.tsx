"use client";

import CandidateHeader from "@/components/candidate-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type BlogForm = z.infer<typeof blogSchema>;

function MarkdownInfo() {
  return (
    <div className="text-xs text-gray-500 mb-2">
      <b>Markdown tips:</b> <br />
      <span>
        <code>#</code> for <b>Heading 1</b>, <code>**bold**</code> for{" "}
        <b>bold</b>, <code>*italic*</code> for <i>italic</i>,{" "}
        <code>`code`</code> for <b>inline code</b>.<br />
        Use <code>-</code> or <code>*</code> for lists.
        <br />
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Full Markdown Guide
        </a>
      </span>
    </div>
  );
}

function BlogFormComponent({ onCreated }: { onCreated?: () => void }) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogForm>({ resolver: zodResolver(blogSchema) });

  const mutation = useMutation({
    mutationFn: (data: BlogForm) => _axios.post("/blogs/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
      reset();
      setPreview(false);
      onCreated?.();
    },
  });

  const content = watch("content");
  const title = watch("title");

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-2 border p-4 rounded mb-6"
    >
      <MarkdownInfo />
      <input
        {...register("title")}
        placeholder="Title"
        className="w-full border rounded p-2"
        disabled={isSubmitting}
      />
      {errors.title && (
        <div className="text-red-500 text-xs">{errors.title.message}</div>
      )}
      <textarea
        {...register("content")}
        placeholder="Markdown content"
        className="w-full border rounded p-2 min-h-[100px]"
        disabled={isSubmitting}
      />
      {errors.content && (
        <div className="text-red-500 text-xs">{errors.content.message}</div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Blog"}
        </Button>
        <Button
          type="button"
          variant={preview ? "default" : "outline"}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? "Hide Preview" : "Preview"}
        </Button>
      </div>
      {preview && (
        <div className="border rounded p-2 mt-2 bg-gray-50">
          <div className="font-bold mb-1">Preview:</div>
          <div className="prose max-w-none">
            <ReactMarkdown>{`# ${title}\n${content}`}</ReactMarkdown>
          </div>
        </div>
      )}
    </form>
  );
}

export default function CandidateBlogsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const {
    data: myBlogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-blogs"],
    queryFn: async () => (await _axios.get("/blogs/my/")).data,
  });

  return (
    <div className="mx-auto ">
      <CandidateHeader />
      <h1 className="text-3xl font-bold my-4">My Notes</h1>
      {!showForm && (
        <button
          className="mb-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => setShowForm(true)}
        >
          Create New Blog
        </button>
      )}
      {showForm && (
        <BlogFormComponent
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["my-blogs"] });
            setShowForm(false);
          }}
        />
      )}
      <div className="space-y-4">
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-500">Failed to load blogs.</div>}
        {myBlogs?.map((blog: any) => (
          <Link
            key={blog.id}
            href={`/dashboard/candidate/blogs/${blog.id}`}
            className="block"
          >
            <Card className="p-4 cursor-pointer hover:bg-muted transition">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg line-clamp-2">
                  {blog.title}
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                by {blog.author_username} •{" "}
                {new Date(blog.created_at).toLocaleString()}
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {blog.content.slice(0, 300) +
                    (blog.content.length > 300 ? "..." : "")}
                </ReactMarkdown>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
