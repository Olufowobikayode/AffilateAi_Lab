import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface CircuitBreakerOptions {
  failureThreshold: number; // Number of consecutive failures before opening the circuit
  resetTimeout: number;    // Time in ms after which the circuit transitions to half-open
}

interface ApiClientOptions {
  baseURL: string;
  timeout: number; // Request timeout in ms
  retries: number; // Number of retries on failure
  retryDelay: number; // Delay between retries in ms
  circuitBreaker?: CircuitBreakerOptions;
}

class ApiClient {
  private client: AxiosInstance;
  private options: ApiClientOptions;
  private failureCount: number = 0;
  private circuitOpen: boolean = false;
  private nextAttemptTime: number = 0;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.client = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout,
    });
  }

  private openCircuit() {
    this.circuitOpen = true;
    this.nextAttemptTime = Date.now() + this.options.circuitBreaker!.resetTimeout;
    console.warn(`Circuit opened for ${this.options.baseURL}. Next attempt at ${new Date(this.nextAttemptTime).toLocaleTimeString()}`);
  }

  private closeCircuit() {
    this.circuitOpen = false;
    this.failureCount = 0;
    console.log(`Circuit closed for ${this.options.baseURL}`);
  }

  private halfOpenCircuit() {
    this.circuitOpen = false; // Temporarily close to allow one request
    console.log(`Circuit half-opened for ${this.options.baseURL}. Trying next request.`);
  }

  private checkCircuit() {
    if (this.circuitOpen) {
      if (Date.now() > this.nextAttemptTime) {
        this.halfOpenCircuit();
      } else {
        throw new Error(`Circuit is open for ${this.options.baseURL}. Too many failures.`);
      }
    }
  }

  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.checkCircuit();

    for (let i = 0; i <= this.options.retries; i++) {
      try {
        const response = await this.client.request<T>(config);
        this.closeCircuit(); // Reset circuit on success
        return response;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error(`Request to ${this.options.baseURL}${config.url} failed (attempt ${i + 1}/${this.options.retries + 1}):`, error.message);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }

          this.failureCount++;
          if (this.options.circuitBreaker && this.failureCount >= this.options.circuitBreaker.failureThreshold) {
            this.openCircuit();
          }

          if (i < this.options.retries) {
            await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
          } else {
            throw new Error(`Max retries reached for ${this.options.baseURL}${config.url}: ${error.message}`);
          }
        } else {
          // Non-Axios error
          throw error;
        }
      }
    }
    throw new Error('Should not reach here'); // Fallback, should be caught by the loop
  }
}

export default ApiClient;