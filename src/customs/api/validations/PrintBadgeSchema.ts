import { z } from 'zod';

export const PrintBadgeSchema = z.object({
  ogo: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      async (file) => {
        if (!file) return true; // ⬅️ PENTING: skip kalau tidak upload

        const img = new Image();
        const url = URL.createObjectURL(file);

        const valid = await new Promise<boolean>((resolve) => {
          img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img.width <= 144 && img.height <= 144);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
          };
          img.src = url;
        });

        return valid;
      },
      { message: 'Logo max size 144 x 144 px' },
    ),

    name: z.string().min(1, 'Name required').max(255, 'Max 255 characters'),

  footer_text: z.string().min(1, 'Footer text required').max(255, 'Max 255 characters'),

  printer_name: z.string().min(1, 'Printer name required'),

  // printer_vendor_id: z.string().min(1, 'Printer vendor id required'),

  printer_paper_size: z
    .number({
      required_error: 'Paper size is required',
      invalid_type_error: 'Must be a number',
    })
    .int('Must be integer')
    .positive('Must be greater than 0'),
});
