import { z } from "zod";

export const citySchema = z.object({
  kaupunki: z.string().min(4, { message: "Kirjoita vähintään 4 kirjainta" }),
});

export type CityData = z.infer<typeof citySchema>;

export function validateCityData(data: unknown): CityData {
  const validated = citySchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.errors[0].message);
  }
  return validated.data;
}
