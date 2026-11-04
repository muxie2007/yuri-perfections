import { z } from "zod";

/** The contact form's rules, shared by the form (instant feedback) and the server action. */
export const enquirySchema = z.object({
    name: z.string().trim().min(2, "Please enter your name.").max(120, "That name is too long."),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
    phone: z
        .string()
        .trim()
        .max(40, "That phone number is too long.")
        .regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only."),
    service: z.string().trim().max(120),
    message: z
        .string()
        .trim()
        .min(10, "Tell us a little more (at least 10 characters).")
        .max(5000, "Please keep it under 5,000 characters."),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
