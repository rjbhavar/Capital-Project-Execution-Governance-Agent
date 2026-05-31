/**
 * Resilience Service
 * 
 * Implements retry logic, circuit breakers, fallbacks, and recovery patterns.
 * Ensures system reliability and fault tolerance.
 */

class ResilienceService {
  constructor() {
    this.circuitBreakers = new Map();
    this.retryConfigs = new Map();
  }

  /**
   * Execute with retry
   */
  async executeWithRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
      onRetry = null,
      shouldRetry = null
    } = options;

    let lastError;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;

        // Check if we should retry
        if (shouldRetry && !shouldRetry(error, attempt)) {
          throw error;
        }

        // Don't retry if max attempts reached
        if (attempt > maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);

        // Call retry callback
        if (onRetry) {
          onRetry(error, attempt, delay);
        }

        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);

        // Wait before retry
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Execute with circuit breaker
   */
  async executeWithCircuitBreaker(key, fn, options = {}) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      onOpen = null,
      onHalfOpen = null,
      onClose = null
    } = options;

    // Get or create circuit breaker
    let breaker = this.circuitBreakers.get(key);
    if (!breaker) {
      breaker = {
        state: 'closed', // closed, open, half-open
        failures: 0,
        lastFailureTime: null,
        successCount: 0
      };
      this.circuitBreakers.set(key, breaker);
    }

    // Check circuit breaker state
    if (breaker.state === 'open') {
      const timeSinceFailure = Date.now() - breaker.lastFailureTime;
      
      if (timeSinceFailure >= resetTimeout) {
        // Try half-open
        breaker.state = 'half-open';
        breaker.successCount = 0;
        if (onHalfOpen) onHalfOpen();
      } else {
        throw new Error(`Circuit breaker open for ${key}`);
      }
    }

    try {
      const result = await fn();

      // Success - update breaker
      if (breaker.state === 'half-open') {
        breaker.successCount++;
        if (breaker.successCount >= 3) {
          breaker.state = 'closed';
          breaker.failures = 0;
          if (onClose) onClose();
        }
      } else {
        breaker.failures = 0;
      }

      return result;
    } catch (error) {
      // Failure - update breaker
      breaker.failures++;
      breaker.lastFailureTime = Date.now();

      if (breaker.failures >= failureThreshold) {
        breaker.state = 'open';
        if (onOpen) onOpen();
      }

      throw error;
    }
  }

  /**
   * Execute with fallback
   */
  async executeWithFallback(fn, fallbackFn) {
    try {
      return await fn();
    } catch (error) {
      console.log('Primary function failed, using fallback');
      return await fallbackFn(error);
    }
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(fn, timeoutMs) {
    return Promise.race([
      fn(),
      this.timeout(timeoutMs)
    ]);
  }

  /**
   * Execute with bulkhead (rate limiting)
   */
  async executeWithBulkhead(key, fn, maxConcurrent = 10) {
    // Simple implementation - in production use proper semaphore
    const bulkhead = this.getBulkhead(key);
    
    if (bulkhead.current >= maxConcurrent) {
      throw new Error(`Bulkhead limit reached for ${key}`);
    }

    bulkhead.current++;
    try {
      return await fn();
    } finally {
      bulkhead.current--;
    }
  }

  /**
   * Execute with all resilience patterns
   */
  async executeResilient(fn, options = {}) {
    const {
      retry = true,
      circuitBreaker = true,
      fallback = null,
      timeout = null,
      bulkhead = null,
      key = 'default'
    } = options;

    let wrappedFn = fn;

    // Apply timeout
    if (timeout) {
      const originalFn = wrappedFn;
      wrappedFn = () => this.executeWithTimeout(originalFn, timeout);
    }

    // Apply bulkhead
    if (bulkhead) {
      const originalFn = wrappedFn;
      wrappedFn = () => this.executeWithBulkhead(key, originalFn, bulkhead);
    }

    // Apply circuit breaker
    if (circuitBreaker) {
      const originalFn = wrappedFn;
      wrappedFn = () => this.executeWithCircuitBreaker(key, originalFn, options.circuitBreakerOptions);
    }

    // Apply retry
    if (retry) {
      const originalFn = wrappedFn;
      wrappedFn = () => this.executeWithRetry(originalFn, options.retryOptions);
    }

    // Apply fallback
    if (fallback) {
      return this.executeWithFallback(wrappedFn, fallback);
    }

    return wrappedFn();
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(key) {
    return this.circuitBreakers.get(key) || null;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(key) {
    const breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failures = 0;
      breaker.successCount = 0;
    }
  }

  /**
   * Get all circuit breakers
   */
  getAllCircuitBreakers() {
    return Array.from(this.circuitBreakers.entries()).map(([key, breaker]) => ({
      key,
      ...breaker
    }));
  }

  /**
   * Get bulkhead
   */
  getBulkhead(key) {
    if (!this.bulkheads) {
      this.bulkheads = new Map();
    }
    
    if (!this.bulkheads.has(key)) {
      this.bulkheads.set(key, { current: 0 });
    }
    
    return this.bulkheads.get(key);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Timeout helper
   */
  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
  }

  /**
   * Batch operations with retry
   */
  async executeBatch(operations, options = {}) {
    const {
      batchSize = 10,
      continueOnError = true,
      retryOptions = {}
    } = options;

    const results = [];
    const errors = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(op => this.executeWithRetry(op, retryOptions))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            index: i + index,
            error: result.reason
          });
          
          if (!continueOnError) {
            throw result.reason;
          }
        }
      });
    }

    return { results, errors };
  }

  /**
   * Execute with compensation (saga pattern)
   */
  async executeWithCompensation(steps) {
    const completedSteps = [];
    
    try {
      for (const step of steps) {
        const result = await step.execute();
        completedSteps.push({ step, result });
      }
      return { success: true, results: completedSteps.map(s => s.result) };
    } catch (error) {
      // Compensate in reverse order
      console.log('Error occurred, compensating...');
      
      for (let i = completedSteps.length - 1; i >= 0; i--) {
        const { step, result } = completedSteps[i];
        if (step.compensate) {
          try {
            await step.compensate(result);
          } catch (compensationError) {
            console.error('Compensation failed:', compensationError);
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * Health check with circuit breaker
   */
  async healthCheck(services) {
    const results = {};
    
    for (const [name, checkFn] of Object.entries(services)) {
      try {
        const result = await this.executeWithCircuitBreaker(
          `health-${name}`,
          checkFn,
          { failureThreshold: 3, resetTimeout: 30000 }
        );
        results[name] = { status: 'healthy', ...result };
      } catch (error) {
        results[name] = { status: 'unhealthy', error: error.message };
      }
    }
    
    return results;
  }
}

/**
 * Retry Strategies
 */
export const RetryStrategies = {
  /**
   * Exponential backoff
   */
  exponentialBackoff: (baseDelay = 1000, maxDelay = 30000) => ({
    maxRetries: 5,
    delayMs: baseDelay,
    backoffMultiplier: 2,
    shouldRetry: (error, attempt) => {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      return delay <= maxDelay;
    }
  }),

  /**
   * Linear backoff
   */
  linearBackoff: (delay = 1000, maxRetries = 3) => ({
    maxRetries,
    delayMs: delay,
    backoffMultiplier: 1
  }),

  /**
   * Immediate retry
   */
  immediate: (maxRetries = 3) => ({
    maxRetries,
    delayMs: 0,
    backoffMultiplier: 1
  }),

  /**
   * Retry on specific errors
   */
  onSpecificErrors: (errorCodes, baseStrategy) => ({
    ...baseStrategy,
    shouldRetry: (error, attempt) => {
      return errorCodes.includes(error.code) && 
             (!baseStrategy.shouldRetry || baseStrategy.shouldRetry(error, attempt));
    }
  })
};

// Export singleton instance
export const resilienceService = new ResilienceService();

export default resilienceService;

// Made with Bob
