const keys = [
  "AWS_REGION",
  "IOT_ENDPOINT",
  "IOT_TOPIC",
  "MEDIALIVE_CHANNEL_ID"
] as const;

const env: Record<string, string> = {};
for (const key of keys) {
  env[key] = process.env[key] as string;
}

export default env as Record<typeof keys[number], string>;
