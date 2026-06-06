export default function AvatarPawn({ palette }) {
  return (
    <div
      className={`
        absolute -top-3 left-1/2 z-20 h-6 w-6 -translate-x-1/2
        rounded-full border-4 border-black
        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
        ${palette.pawn}
      `}
      aria-label="Your pawn"
      title="You are here"
    />
  );
}
