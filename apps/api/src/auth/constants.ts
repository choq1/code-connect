const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    'JWT_SECRET environment variable is required (see apps/api/.env.example)',
  );
}

export const jwtConstants = { secret };
