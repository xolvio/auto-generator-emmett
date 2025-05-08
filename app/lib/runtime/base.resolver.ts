import { AckNack } from "./base-gql-types";

export const baseResolvers = {
  AckNack: {
    __resolveType(obj: AckNack) {
      return obj.success ? "Ack" : "Nack";
    },
  },
};
