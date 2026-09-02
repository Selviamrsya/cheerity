const config = {
  env: {
    apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
    prodApiEndpoint: process.env.NEXT_PUBLIC_PROD_API_ENDPOINT!,
    imagekit: {
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    },
    databaseUrl: process.env.DATABASE_URL!,
    upstash: {
      redisUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDISH_URL!,
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDISH_TOKEN!,
      qtashUrl: process.env.QSTASH_URL || process.env.QTASH_URL!,
      qtashToken: process.env.QSTASH_TOKEN || process.env.QTASH_TOKEN!,
    },
    resendToken: process.env.RESEND_TOKEN!,
  },
};

export default config;
