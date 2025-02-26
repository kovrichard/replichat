export default function PoweredByBadge() {
  const source = `utm_source=${window.location.hostname}`;
  const medium = "utm_medium=referral";
  const campaign = "utm_campaign=powered-by-badge";

  return (
    <div className="flex items-center gap-2 text-sm text-black">
      <p>Powered by</p>
      <a
        href={`https://remiq.ai/?${source}&${medium}&${campaign}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 hover:underline"
      >
        <img
          src="https://cdn.askth.ing/icon.png"
          alt="Remiq logo - go to Remiq.ai"
          width={20}
          height={20}
        />
        <p>Remiq</p>
      </a>
    </div>
  );
}
