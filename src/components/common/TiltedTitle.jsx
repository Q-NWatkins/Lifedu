/**
 * A neubrutalist section-title banner: a bordered "plate" behind level, centered
 * lettering. The plate is an absolute-positioned, aria-hidden sibling; the text
 * sits on top (`relative z-10`). Everything is kept perfectly horizontal
 * (`rotate-0 skew-x-0 skew-y-0`) — no tilt or skew — so the box and its text are
 * flush and straight. The thick black border + flat drop-shadow are retained.
 */
export default function TiltedTitle({
  as: Tag = 'h1',
  children,
  className = '',
  plateClassName = '',
}) {
  return (
    <Tag className="relative inline-block rotate-0 skew-x-0 skew-y-0">
      <span
        aria-hidden="true"
        className={`absolute inset-0 rotate-0 skew-x-0 rounded-xl border-4 border-black bg-indigo-950 shadow-[0_6px_0_rgba(0,0,0,0.35)] ${plateClassName}`}
      />
      <span className={`relative z-10 block rotate-0 skew-x-0 skew-y-0 px-4 py-1 ${className}`}>
        {children}
      </span>
    </Tag>
  );
}