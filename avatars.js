// Original chibi-style avatars, drawn as simple SVG in each character's colours and signature look.
(function () {
  var SK = "#F6D7BE";
  function wrap(inner) {
    return '<svg class="fig-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#14161C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">' + inner + "</g></svg>";
  }
  var neck = '<rect x="52" y="80" width="16" height="14" fill="' + SK + '"/>';
  var head = '<ellipse cx="60" cy="60" rx="26" ry="28" fill="' + SK + '"/>';
  function body(fill) { return '<path d="M16 122 C18 100 36 91 60 91 C84 91 102 100 104 122 Z" fill="' + fill + '"/>'; }

  var A = {
    gojo: wrap(
      body("#1E2433") +
      '<path d="M44 91 L76 91 L74 106 L46 106 Z" fill="#2A3142"/>' + neck + head +
      '<path d="M32 58 L28 32 L40 40 L41 18 L52 32 L60 10 L67 31 L79 16 L80 38 L93 30 L88 58 C84 44 74 37 60 37 C46 37 36 44 32 58 Z" fill="#F2F4F8"/>' +
      '<rect x="31" y="50" width="58" height="12" rx="3" fill="#14161C"/>' +
      '<path d="M53 76 Q60 81 67 76" fill="none"/>'
    ),
    naruto: wrap(
      body("#F07A1A") +
      '<path d="M30 100 C40 93 50 91 60 91 C70 91 80 93 90 100 L84 107 L36 107 Z" fill="#22252E"/>' + neck + head +
      '<path d="M30 60 L22 42 L36 43 L33 24 L46 32 L50 13 L60 27 L70 13 L74 32 L87 24 L84 43 L98 42 L90 60 C86 47 74 40 60 40 C46 40 34 47 30 60 Z" fill="#F7C531"/>' +
      '<rect x="31" y="40" width="58" height="12" rx="2" fill="#2A3A6B"/>' +
      '<rect x="46" y="41" width="28" height="10" rx="2" fill="#C9CED6"/>' +
      '<path d="M60 46a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3 3 0 0 1 6 0" fill="none" stroke-width="1.4"/>' +
      '<circle cx="50" cy="62" r="3.4" fill="#2A6FDB"/><circle cx="70" cy="62" r="3.4" fill="#2A6FDB"/>' +
      '<path d="M37 68 L45 69 M37 72 L45 72 M37 76 L45 75 M83 68 L75 69 M83 72 L75 72 M83 76 L75 75" stroke-width="1.6"/>' +
      '<path d="M51 76 Q60 86 69 76 Z" fill="#FFFFFF"/>'
    ),
    kakashi: wrap(
      body("#5B6B45") +
      '<path d="M42 91 L78 91 L76 104 L44 104 Z" fill="#2B3140"/>' +
      '<rect x="52" y="80" width="16" height="14" fill="#2B3140"/>' + head +
      '<path d="M32 58 C30 42 38 31 50 27 L44 12 L59 22 L63 5 L72 22 L87 9 L85 28 L100 26 L89 41 L96 53 L87 51 C84 43 74 38 60 38 C46 38 36 45 32 58 Z" fill="#D3D8E0"/>' +
      '<path d="M31 45 L89 51 L89 64 L31 57 Z" fill="#2A3A6B"/>' +
      '<path d="M60 48 L88 51 L88 63 L60 60 Z" fill="#C9CED6"/>' +
      '<path d="M43 63 Q48 60 53 63" fill="none"/><path d="M44 65 L52 65" stroke-width="1.6"/>' +
      '<path d="M34 67 C34 84 46 89 60 89 C74 89 86 84 86 67 Z" fill="#2B3140"/>' +
      '<path d="M60 70 L58 78" fill="none" stroke="#4A5468" stroke-width="1.6"/>'
    ),
    nezuko: wrap(
      '<path d="M26 60 C22 88 22 108 28 122 L92 122 C98 108 98 88 94 60 C92 36 78 28 60 28 C42 28 28 36 26 60 Z" fill="#1B1B22"/>' +
      '<path d="M25 104 L95 104 L93 122 L27 122 Z" fill="#E07A3C"/>' +
      body("#EC9DBB") +
      '<path d="M50 91 L60 106 L70 91" fill="none" stroke="#FFFFFF" stroke-width="3"/>' + neck + head +
      '<path d="M34 60 C35 41 46 32 60 32 C74 32 85 41 86 60 L79 47 L73 57 L66 43 L59 55 L52 43 L46 57 L40 47 Z" fill="#1B1B22"/>' +
      '<path d="M80 34 L93 25 L93 43 Z M80 34 L69 25 L69 41 Z" fill="#F2A0BE"/>' +
      '<ellipse cx="50" cy="62" rx="3.6" ry="4.2" fill="#E0559A"/><ellipse cx="70" cy="62" rx="3.6" ry="4.2" fill="#E0559A"/>' +
      '<path d="M40 76 L32 70 M80 76 L88 70" stroke="#C8322B" stroke-width="2.4"/>' +
      '<rect x="39" y="72" width="42" height="9" rx="4.5" fill="#6FA34A"/>' +
      '<path d="M53 72 L53 81 M67 72 L67 81" stroke-width="1.8"/>'
    )
  };
  // Stats for the select screen: energy, focus, rest (out of 5).
  var STATS = { gojo: [5, 4, 2], naruto: [5, 3, 1], kakashi: [2, 5, 3], nezuko: [1, 2, 5] };
  window.AE_DATA.CHARS.forEach(function (c) { c.avatar = A[c.id]; c.stats = STATS[c.id]; });
})();
