export function Logo({ size = 36 }: { size?: number }) {
  const dots = [
    "#FF7A45",
    "#FF4D8D",
    "#7C5CFF",
    "#86B916",
    "#FFAA1D",
    "#1FA3C9",
  ];
  const holes: [number, number][] = [
    [16, 12],
    [24, 12],
    [32, 12],
    [16, 19],
    [24, 19],
    [32, 19],
    [16, 26],
    [24, 26],
    [32, 26],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Paddle handle */}
      <rect x="20" y="32" width="8" height="13" rx="4" fill="#FFFFFF" />
      {/* Paddle face */}
      <rect x="8" y="4" width="32" height="30" rx="15" fill="#FFFFFF" />
      {/* Color-hole grid — the paddle's texture doubles as the "Kulay" (color) motif */}
      {holes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.6" fill={dots[i % dots.length]} />
      ))}
    </svg>
  );
}
