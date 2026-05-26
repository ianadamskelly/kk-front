// JsonLd renders a schema.org structured-data block as a JSON-LD
// <script> in the document. Drop one (or more) into the JSX of any
// page that should publish rich snippets — search engines and link
// previewers consume it via document parsing, not client JS.
//
// dangerouslySetInnerHTML is the correct approach here: the alternative
// (JSX children) would force React to text-encode the JSON, which
// breaks parsers that look for raw `{`/`}` characters. The object is
// always serialised through JSON.stringify so it's never a string
// concat path.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
