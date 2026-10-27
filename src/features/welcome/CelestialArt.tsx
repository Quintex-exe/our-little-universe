export function CelestialArt() {
  return (
    <svg className="art" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="art-planet" cx="35%" cy="30%" r="75%">
          <stop offset="0" className="art__stop-a" />
          <stop offset="1" className="art__stop-b" />
        </radialGradient>
        <mask id="art-crescent">
          <rect width="600" height="600" fill="#fff" />
          <circle cx="129" cy="433" r="14" fill="#000" />
        </mask>
      </defs>

      <circle className="art__line" cx="300" cy="300" r="140" />
      <g className="art__spin art__spin--slow">
        <circle className="art__line" cx="300" cy="300" r="240" />
        <circle className="art__dot" cx="540" cy="300" r="5" />
      </g>
      <g className="art__spin art__spin--rev">
        <ellipse className="art__line" cx="300" cy="300" rx="280" ry="110" transform="rotate(-24 300 300)" />
        <circle className="art__dot art__dot--soft" cx="40" cy="391" r="4" transform="rotate(0 300 300)" />
      </g>

      <g className="art__float art__float--a">
        <circle cx="476" cy="148" r="20" fill="url(#art-planet)" />
        <ellipse className="art__planet-ring" cx="476" cy="148" rx="34" ry="8" transform="rotate(-18 476 148)" />
      </g>
      <g className="art__float art__float--b">
        <circle className="art__moon" cx="120" cy="440" r="16" mask="url(#art-crescent)" />
      </g>
      <g className="art__float art__float--c">
        <circle className="art__dot art__dot--soft" cx="96" cy="170" r="3" />
        <circle className="art__dot art__dot--soft" cx="520" cy="470" r="2.5" />
      </g>
    </svg>
  );
}
