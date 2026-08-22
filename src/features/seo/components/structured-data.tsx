export function StructuredData({ value }: { value: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
      type="application/ld+json"
    />
  );
}
