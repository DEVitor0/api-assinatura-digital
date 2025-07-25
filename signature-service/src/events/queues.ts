import { publishEvent } from "../events/eventPublisher";

(async () => {
  await publishEvent({
    type: "assinatura_confirmada",
    payload: {
      documentId: "123",
      userId: "456",
      sessionId: "789",
      timestamp: new Date().toISOString(),
    },
  });
})();
