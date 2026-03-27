window.OneSignalDeferred = window.OneSignalDeferred || [];

OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "76180fcf-b0a7-4ac9-a1d6-f06af63e67b2",

    notifyButton: {
      enable: true,
    },

    allowLocalhostAsSecureOrigin: true,
  });

  console.log("✅ OneSignal inicializado");

  // Pedir permiso AUTOMÁTICO
  const permission = await OneSignal.Notifications.requestPermission();

  console.log("🔔 Permiso:", permission);

  if (permission === "granted") {
    const subscription = await OneSignal.User.PushSubscription.getId();
    console.log("📱 Player ID:", subscription);
  }
});