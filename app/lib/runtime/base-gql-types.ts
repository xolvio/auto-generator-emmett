interface Ack {
  success: true;
}

interface Nack {
  success: false;
  reason: string;
}

export type AckNack = Ack | Nack;
