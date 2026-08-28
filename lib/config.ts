const config = {
  env: {
    apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000",
    imagekit: {
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    },
    databaseUrl: process.env.DATABASE_URL!,
    upstash:{
      redisUrl: process.env.UPSTASH_REDISH_URL,
      redisToken: process.env.UPSTASH_REDISH_TOKEN,
      qtashUrl: process.env.QTASH_URL,
      qtashToken: process.env.QTASH_TOKEN,
    }
  },
};

export default config;
