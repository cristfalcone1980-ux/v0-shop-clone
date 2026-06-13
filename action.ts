"use server";

export async function verificarApiKey() {
  const clave = process.env.SUMUP_API_KEY;
  
  if (!clave) {
    console.log("❌ ERROR: La variable SUMUP_API_KEY está vacía o no existe en v0.");
    return { success: false, message: "La variable no está configurada en v0." };
  }

  // 👁️ Esto imprimirá tu clave real en la pestaña de logs/consola de v0
  console.log("=========================================");
  console.log("🔑 TU API KEY DE SUMUP ES:", clave);
  console.log("=========================================");

  return { success: true, message: "¡Clave leída con éxito en el servidor!" };
}
