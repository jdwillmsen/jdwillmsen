// Renders the profile trophy card to files at build time, so the README no
// longer depends on a hosted trophy service staying up.
// Usage: GITHUB_TOKEN1=... deno run -A scripts/trophy.ts <user> <out.svg>:<theme>...
const base =
  "https://raw.githubusercontent.com/ryo-ma/github-profile-trophy/e3c89df995e92e67cdd4b2acaab9d974583dc1f7/src";
const { GithubApiService } = await import(`${base}/Services/GithubApiService.ts`);
const { Card } = await import(`${base}/card.ts`);
const { COLORS } = await import(`${base}/theme.ts`);

const [username, ...outputs] = Deno.args;
if (!username || outputs.length === 0) {
  console.error("usage: trophy.ts <user> <out.svg>:<theme>...");
  Deno.exit(1);
}

const userInfo = await new GithubApiService().requestUserInfo(username);
if (userInfo?.totalCommits === undefined) {
  console.error("failed to fetch user info:", userInfo);
  Deno.exit(2);
}

for (const output of outputs) {
  const [path, theme] = output.split(":");
  // Same layout the hosted card used: one row of seven, no frame.
  const svg = new Card([], [], 7, 1, 110, 0, 0, false, true)
    .render(userInfo, COLORS[theme]);
  await Deno.mkdir(path.replace(/\/[^/]+$/, ""), { recursive: true });
  await Deno.writeTextFile(path, svg);
  console.log("wrote", path);
}
