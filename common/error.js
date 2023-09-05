export class ZKGraphRequireFailed extends Error{
    constructor(message) {
      super(message);
    }
}

export class ImageAlreadyExists extends Error{
    constructor(message) {
        super(message);
      }
}

export class PaymentError extends Error{
    constructor(message) {
        super(message);
      }
}