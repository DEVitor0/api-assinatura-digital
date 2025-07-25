import { createMachine } from "xstate";

export type SignatureStatus = "pendente" | "assinado" | "rejeitado";

export const signatureStatusMachine = createMachine({
  id: "signatureStatus",
  initial: "pendente",
  states: {
    pendente: {
      on: {
        ASSINAR: "assinado",
        REJEITAR: "rejeitado",
      },
    },
    assinado: {
      type: "final",
    },
    rejeitado: {
      type: "final",
    },
  },
});
