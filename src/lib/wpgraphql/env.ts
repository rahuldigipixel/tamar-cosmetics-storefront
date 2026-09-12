function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}. Check your .env.local / .env.staging / .env.production file.`);
  }
  return value;
}

export const wpEnv = {
  wordpressUrl: required("NEXT_PUBLIC_WORDPRESS_URL", process.env.NEXT_PUBLIC_WORDPRESS_URL),
  graphqlUrl: required("NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL", process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  appUser: process.env.WORDPRESS_APP_USER ?? "",
  appPassword: process.env.WORDPRESS_APP_PASSWORD ?? "",
  revalidationSecret: process.env.REVALIDATION_SECRET_TOKEN ?? "",
};
