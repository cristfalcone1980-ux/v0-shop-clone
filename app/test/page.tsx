import CheckoutSimulado from "@/components/CheckoutSimulado";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Panel de Control de Pruebas
        </h1>
        
        {/* Aquí enroscamos tu componente para que sea visible */}
        <CheckoutSimulado />
        
      </div>
    </div>
  );
}

