import { z } from "zod";

export const RevendedoraStatusSchema = z.enum([
  "Ativa",
  "Inativa",
  "Em prospecção",
]);
export type RevendedoraStatus = z.infer<typeof RevendedoraStatusSchema>;

export const GeocodePrecisionSchema = z.enum(["exact", "approximate", "failed"]);
export type GeocodePrecision = z.infer<typeof GeocodePrecisionSchema>;

export const RevendedoraSchema = z.object({
  id: z.number(),
  nome: z.string(),
  rua: z.string(),
  numero: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string(),
  cep: z.string(),
  status: RevendedoraStatusSchema,
  lat: z.number(),
  lng: z.number(),
  geocodePrecision: GeocodePrecisionSchema,
});
export type Revendedora = z.infer<typeof RevendedoraSchema>;

export const RevendedoraComDistanciaSchema = RevendedoraSchema.extend({
  distanciaKm: z.number(),
});
export type RevendedoraComDistancia = z.infer<
  typeof RevendedoraComDistanciaSchema
>;

export const SearchInputSchema = z
  .object({
    cep: z.string().trim().optional(),
    rua: z.string().trim().optional(),
    numero: z.string().trim().optional(),
    bairro: z.string().trim().optional(),
    cidade: z.string().trim().optional(),
  })
  .refine(
    (data) => Boolean(data.cep) || Boolean(data.rua) || Boolean(data.bairro),
    { message: "Informe ao menos um CEP, rua ou bairro para buscar." },
  );
export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchResponseSchema = z.object({
  enderecoResolvido: z.object({
    label: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  resultados: z.array(RevendedoraComDistanciaSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
