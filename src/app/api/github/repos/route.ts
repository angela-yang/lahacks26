import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

type GitHubApiRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const client = await clerkClient();
  const tokenResponse = await client.users.getUserOauthAccessToken(
    userId,
    "github",
  );

  const accessToken = tokenResponse.data[0]?.token;

  if (!accessToken) {
    return NextResponse.json(
      { error: "GitHub access token not found for this account." },
      { status: 403 },
    );
  }

  const response = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories." },
      { status: response.status },
    );
  }

  const repos = (await response.json()) as GitHubApiRepo[];

  return NextResponse.json(
    {
      repositories: repos.map((repo) => ({
        id: String(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
      })),
    },
    { status: 200 },
  );
}