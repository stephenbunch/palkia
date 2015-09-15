export default class ServiceNotFoundError extends Error {
  constructor( message ) {
    super();
    this.name = 'ServiceNotFoundError';
    this.message = message;
  }
};
