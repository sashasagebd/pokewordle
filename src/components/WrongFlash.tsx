// Full-screen red flash; bump `count` on each wrong answer so it remounts and replays
export default function WrongFlash({ count }: { count: number }) {
    if(count === 0) return null;
    return <div key={count} className="fixed inset-0 z-50 pointer-events-none bg-bad/35 animate-flash" />
}
