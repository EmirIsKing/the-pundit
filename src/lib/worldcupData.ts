// FIFA World Cup 2026 — Teams, Groups, and Notable Players
// 48-team format: 12 groups of 4

export interface WCTeam {
  name: string;
  code: string; // FIFA code
  flag: string; // emoji flag
  confederation: string;
  group: string;
}

export interface WCPlayer {
  name: string;
  team: string;
  position: string;
}

export const WC_GROUPS: Record<string, string[]> = {
  A: ["Canada", "Argentina", "Morocco", "Suriname"],
  B: ["Mexico", "Ecuador", "Bolivia", "Iceland"],
  C: ["United States", "Colombia", "Guinea", "New Zealand"],
  D: ["Brazil", "Italy", "Albania", "Bahrain"],
  E: ["England", "Denmark", "China PR", "Tonga"],
  F: ["France", "Saudi Arabia", "Australia", "Indonesia"],
  G: ["Spain", "Portugal", "Uruguay", "Cameroon"],
  H: ["Germany", "Japan", "Kenya", "Thailand"],
  I: ["Netherlands", "Senegal", "Chile", "Canada"],
  J: ["Belgium", "Switzerland", "South Korea", "Honduras"],
  K: ["Croatia", "Serbia", "Costa Rica", "Uganda"],
  L: ["Nigeria", "Tunisia", "Paraguay", "Panama"],
};

export const WC_TEAMS: WCTeam[] = [
  { name: "Argentina", code: "ARG", flag: "🇦🇷", confederation: "CONMEBOL", group: "A" },
  { name: "Australia", code: "AUS", flag: "🇦🇺", confederation: "AFC", group: "F" },
  { name: "Albania", code: "ALB", flag: "🇦🇱", confederation: "UEFA", group: "D" },
  { name: "Bahrain", code: "BHR", flag: "🇧🇭", confederation: "AFC", group: "D" },
  { name: "Belgium", code: "BEL", flag: "🇧🇪", confederation: "UEFA", group: "J" },
  { name: "Bolivia", code: "BOL", flag: "🇧🇴", confederation: "CONMEBOL", group: "B" },
  { name: "Brazil", code: "BRA", flag: "🇧🇷", confederation: "CONMEBOL", group: "D" },
  { name: "Cameroon", code: "CMR", flag: "🇨🇲", confederation: "CAF", group: "G" },
  { name: "Canada", code: "CAN", flag: "🇨🇦", confederation: "CONCACAF", group: "A" },
  { name: "Chile", code: "CHI", flag: "🇨🇱", confederation: "CONMEBOL", group: "I" },
  { name: "China PR", code: "CHN", flag: "🇨🇳", confederation: "AFC", group: "E" },
  { name: "Colombia", code: "COL", flag: "🇨🇴", confederation: "CONMEBOL", group: "C" },
  { name: "Costa Rica", code: "CRC", flag: "🇨🇷", confederation: "CONCACAF", group: "K" },
  { name: "Croatia", code: "CRO", flag: "🇭🇷", confederation: "UEFA", group: "K" },
  { name: "Denmark", code: "DEN", flag: "🇩🇰", confederation: "UEFA", group: "E" },
  { name: "Ecuador", code: "ECU", flag: "🇪🇨", confederation: "CONMEBOL", group: "B" },
  { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA", group: "E" },
  { name: "France", code: "FRA", flag: "🇫🇷", confederation: "UEFA", group: "F" },
  { name: "Germany", code: "GER", flag: "🇩🇪", confederation: "UEFA", group: "H" },
  { name: "Guinea", code: "GUI", flag: "🇬🇳", confederation: "CAF", group: "C" },
  { name: "Honduras", code: "HON", flag: "🇭🇳", confederation: "CONCACAF", group: "J" },
  { name: "Iceland", code: "ISL", flag: "🇮🇸", confederation: "UEFA", group: "B" },
  { name: "Indonesia", code: "IDN", flag: "🇮🇩", confederation: "AFC", group: "F" },
  { name: "Italy", code: "ITA", flag: "🇮🇹", confederation: "UEFA", group: "D" },
  { name: "Japan", code: "JPN", flag: "🇯🇵", confederation: "AFC", group: "H" },
  { name: "Kenya", code: "KEN", flag: "🇰🇪", confederation: "CAF", group: "H" },
  { name: "Mexico", code: "MEX", flag: "🇲🇽", confederation: "CONCACAF", group: "B" },
  { name: "Morocco", code: "MAR", flag: "🇲🇦", confederation: "CAF", group: "A" },
  { name: "Netherlands", code: "NED", flag: "🇳🇱", confederation: "UEFA", group: "I" },
  { name: "New Zealand", code: "NZL", flag: "🇳🇿", confederation: "OFC", group: "C" },
  { name: "Nigeria", code: "NGA", flag: "🇳🇬", confederation: "CAF", group: "L" },
  { name: "Panama", code: "PAN", flag: "🇵🇦", confederation: "CONCACAF", group: "L" },
  { name: "Paraguay", code: "PAR", flag: "🇵🇾", confederation: "CONMEBOL", group: "L" },
  { name: "Portugal", code: "POR", flag: "🇵🇹", confederation: "UEFA", group: "G" },
  { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", confederation: "AFC", group: "F" },
  { name: "Senegal", code: "SEN", flag: "🇸🇳", confederation: "CAF", group: "I" },
  { name: "Serbia", code: "SRB", flag: "🇷🇸", confederation: "UEFA", group: "K" },
  { name: "South Korea", code: "KOR", flag: "🇰🇷", confederation: "AFC", group: "J" },
  { name: "Spain", code: "ESP", flag: "🇪🇸", confederation: "UEFA", group: "G" },
  { name: "Suriname", code: "SUR", flag: "🇸🇷", confederation: "CONCACAF", group: "A" },
  { name: "Switzerland", code: "SUI", flag: "🇨🇭", confederation: "UEFA", group: "J" },
  { name: "Thailand", code: "THA", flag: "🇹🇭", confederation: "AFC", group: "H" },
  { name: "Tonga", code: "TGA", flag: "🇹🇴", confederation: "OFC", group: "E" },
  { name: "Tunisia", code: "TUN", flag: "🇹🇳", confederation: "CAF", group: "L" },
  { name: "Uganda", code: "UGA", flag: "🇺🇬", confederation: "CAF", group: "K" },
  { name: "United States", code: "USA", flag: "🇺🇸", confederation: "CONCACAF", group: "C" },
  { name: "Uruguay", code: "URU", flag: "🇺🇾", confederation: "CONMEBOL", group: "G" },
];

export const NOTABLE_PLAYERS: WCPlayer[] = [
  { name: "Lionel Messi", team: "Argentina", position: "Forward" },
  { name: "Kylian Mbappé", team: "France", position: "Forward" },
  { name: "Erling Haaland", team: "Norway", position: "Forward" },
  { name: "Vinícius Jr.", team: "Brazil", position: "Forward" },
  { name: "Jude Bellingham", team: "England", position: "Midfielder" },
  { name: "Rodri", team: "Spain", position: "Midfielder" },
  { name: "Lamine Yamal", team: "Spain", position: "Forward" },
  { name: "Florian Wirtz", team: "Germany", position: "Midfielder" },
  { name: "Phil Foden", team: "England", position: "Forward" },
  { name: "Bukayo Saka", team: "England", position: "Forward" },
  { name: "Harry Kane", team: "England", position: "Forward" },
  { name: "Mohamed Salah", team: "Egypt", position: "Forward" },
  { name: "Son Heung-min", team: "South Korea", position: "Forward" },
  { name: "Kevin De Bruyne", team: "Belgium", position: "Midfielder" },
  { name: "Cristiano Ronaldo", team: "Portugal", position: "Forward" },
  { name: "Pedri", team: "Spain", position: "Midfielder" },
  { name: "Jamal Musiala", team: "Germany", position: "Midfielder" },
  { name: "Virgil van Dijk", team: "Netherlands", position: "Defender" },
  { name: "Thibaut Courtois", team: "Belgium", position: "Goalkeeper" },
  { name: "Alisson", team: "Brazil", position: "Goalkeeper" },
  { name: "Emiliano Martínez", team: "Argentina", position: "Goalkeeper" },
  { name: "Gianluigi Donnarumma", team: "Italy", position: "Goalkeeper" },
  { name: "Lautaro Martínez", team: "Argentina", position: "Forward" },
  { name: "Julián Álvarez", team: "Argentina", position: "Forward" },
  { name: "Bruno Fernandes", team: "Portugal", position: "Midfielder" },
  { name: "Alphonso Davies", team: "Canada", position: "Defender" },
  { name: "Christian Pulisic", team: "United States", position: "Forward" },
  { name: "Hirving Lozano", team: "Mexico", position: "Forward" },
  { name: "Sadio Mané", team: "Senegal", position: "Forward" },
  { name: "Victor Osimhen", team: "Nigeria", position: "Forward" },
];

export const PREDICTION_CATEGORIES = [
  { id: "tournament", label: "Tournament Winner", icon: "🏆", description: "Who lifts the trophy?" },
  { id: "group", label: "Group Winner", icon: "📊", description: "Pick each group winner" },
  { id: "golden_boot", label: "Golden Boot", icon: "👟", description: "Top scorer of the tournament" },
  { id: "golden_glove", label: "Golden Glove", icon: "🧤", description: "Best goalkeeper" },
  { id: "dark_horse", label: "Dark Horse", icon: "🐴", description: "Surprise team of the tournament" },
] as const;

export const DEBATE_TOPICS = [
  "Will the USA reach the semi-finals as hosts?",
  "Is Mbappé the best player in the world right now?",
  "Can an African team finally win the World Cup?",
  "Is this Messi's last World Cup?",
  "Will Argentina defend their title?",
  "Is England's golden generation doomed to underperform?",
  "Are European teams overrated in recent World Cups?",
  "Will the 48-team format dilute the quality?",
  "Can Japan upset a traditional powerhouse?",
  "Is Brazil back to their best?",
  "Will home advantage make CONCACAF teams dangerous?",
  "Is the era of tiki-taka football over?",
];
