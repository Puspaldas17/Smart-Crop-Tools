import React from "react";
import readme from "../../README.md?raw";

export default function Docs() {
  return (
    <div className="prose max-w-none prose-headings:scroll-mt-24">
      <h1>Project Documentation</h1>
      <p className="text-sm text-slate-600">
        This page renders the repository README so it is viewable on-site.
      </p>
      <div className="my-4 flex gap-3">
        <a
          href="/README.md"
          className="rounded-md border border-slate-300 px-3 py-1 text-sm"
        >
          Open raw README
        </a>
        <a
          href="/README.md"
          download
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
        >
          Download
        </a>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed">
        {readme}
      </pre>
    </div>
  );
}
