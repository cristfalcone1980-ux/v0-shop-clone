  const handlePayment = async () => {
    setLoading(true)
    setError('')
    console.log("Iniciando proceso de pago..."); // <-- AÑADE ESTA LÍNEA

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // ... (tu código de insert en orders igual que antes)

      console.log("Pedido guardado, enviando Telegram..."); // <-- AÑADE ESTA LÍNEA
      await enviarNotificacionTelegram(order.id)
      console.log("Notificación enviada"); // <-- AÑADE ESTA LÍNEA

      setStep('success')
      onOrderComplete()
    } catch (err: any) {
      console.error("Error detectado:", err); // <-- AÑADE ESTA LÍNEA
      setError(err.message || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }
