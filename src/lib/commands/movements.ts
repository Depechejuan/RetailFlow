import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const movementCommandSchema = z.object({
  type: z.enum(["receipt", "shipment", "transfer", "adjustment"]),
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  sourceStoreId: z.string().uuid().optional(),
  destinationStoreId: z.string().uuid().optional(),
  adjustmentDelta: z.coerce.number().int().optional(),
  note: z.string().trim().max(500).default(""),
});

export async function applyMovement(input: unknown) {
  const command = movementCommandSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Necesitas iniciar sesión.");
  const { data: membership, error: membershipError } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).eq("active", true).limit(1).maybeSingle();
  if (membershipError || !membership) throw new Error("No tienes una organización activa.");
  const { data, error } = await supabase.rpc("apply_inventory_movement", {
    p_organization_id: membership.organization_id,
    p_product_id: command.productId,
    p_type: command.type,
    p_quantity: command.quantity,
    p_source_store_id: command.sourceStoreId ?? null,
    p_destination_store_id: command.destinationStoreId ?? null,
    p_adjustment_delta: command.adjustmentDelta ?? null,
    p_idempotency_key: crypto.randomUUID(),
    p_note: command.note,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
