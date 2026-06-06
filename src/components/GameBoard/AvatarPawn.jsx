export default function AvatarPawn({ palette }) {
  return (
    <div
      className={`absolute -top-2 left-1/2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border-2 shadow-lg ring-2 ${palette.pawn}`}
      aria-label="Your pawn"
      title="You are here"
    />
  );
}
