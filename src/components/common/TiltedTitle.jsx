/**
 * A decorative game-angle title that keeps its wording perfectly straight.
 *
 * The playful tilt lives ONLY on an absolute-positioned, aria-hidden sibling
 * "plate" (`-rotate-2`). The text layer sits on top (`relative z-10`) and
 * explicitly clears any inherited transforms (`rotate-0 skew-x-0 skew-y-0`) so
 * the lettering renders crisp and level regardless of ancestor styling.
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
        className={`absolute inset-0 -rotate-2 rounded-xl border-4 border-black bg-indigo-950 shadow-[0_6px_0_rgba(0,0,0,0.35)] ${plateClassName}`}
      />
      <span className={`relative z-10 block rotate-0 skew-x-0 skew-y-0 px-4 py-1 ${className}`}>
        {children}
      </span>
    </Tag>
  );
}