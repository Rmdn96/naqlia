import { z } from "zod";

export const staffEmailSchema = z.string().trim().toLowerCase().max(254).email();
