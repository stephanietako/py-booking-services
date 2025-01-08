// import { createClient } from "@supabase/supabase-js";
// import sharp from "sharp";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

// async function uploadImageToSupabase(file: File) {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = await sharp(Buffer.from(arrayBuffer))
//       .resize({ width: 800 })
//       .jpeg({ quality: 80 })
//       .toBuffer();

//     const { data, error } = await supabase.storage
//       .from("images")
//       .upload(file.name, buffer, {
//         contentType: "image/jpeg",
//         upsert: true,
//       });

//     if (error) {
//       return { code: "UPLOAD_ERROR", message: error.message };
//     }

//     const imageUrl = `${supabaseUrl}/storage/v1/object/public/images/${data.path}`;

//     return imageUrl;
//   } catch (error) {
//     console.error("Error in uploadImageToSupabase:", error); // Log the error for debugging
//     return {
//       code: "UNKNOWN_ERROR",
//       message: "Une erreur inconnue s'est produite.",
//     };
//   }
// }

// export default uploadImageToSupabase;
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
