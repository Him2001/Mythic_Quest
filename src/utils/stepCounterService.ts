/**
 * Step Counter Service using Device Motion API
 * Detects steps using accelerometer data from mobile devices
 */
export class StepCounterService {
  private static instance: StepCounterService | null = null;
  
  private isTracking = false;
  private stepCount = 0;
  private lastStepTime = 0;
  private accelerationThreshold = 12; // Threshold for step detection
  private minStepInterval = 300; // Minimum time between steps (ms)
  
  // Callback functions
  private onStepCallback?: (stepCount: number) => void;
  private onErrorCallback?: (error: string) => void;
  
  // Motion data for step detection
  private accelerationHistory: number[] = [];
  private historySize = 10;
  
  // Permission and support flags
  private permissionGranted = false;
  private isSupported = false;

  private constructor() {
    this.checkSupport();
  }

  static getInstance(): StepCounterService {
    if (!StepCounterService.instance) {
      StepCounterService.instance = new StepCounterService();
    }
    return StepCounterService.instance;
  }

  /**
   * Check if Device Motion API is supported
   */
  private checkSupport(): void {
    this.isSupported = 'DeviceMotionEvent' in window;
    
    if (!this.isSupported) {
      console.warn('🚶 Device Motion API not supported on this device');
    }
  }

  /**
   * Request permission for device motion (required on iOS 13+)
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('Step counting not supported on this device');
    }

    // For iOS 13+ devices, we need to request permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        this.permissionGranted = permission === 'granted';
        
        if (!this.permissionGranted) {
          throw new Error('Device motion permission denied');
        }
      } catch (error) {
        console.error('🚶 Permission request failed:', error);
        throw new Error('Failed to request device motion permission');
      }
    } else {
      // For other devices, assume permission is granted
      this.permissionGranted = true;
    }

    return this.permissionGranted;
  }

  /**
   * Start step counting
   */
  startCounting(
    onStep: (stepCount: number) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.isSupported) {
      onError?.('Step counting not supported on this device');
      return;
    }

    if (!this.permissionGranted) {
      onError?.('Device motion permission not granted');
      return;
    }

    if (this.isTracking) {
      console.warn('🚶 Step counting already active');
      return;
    }

    this.onStepCallback = onStep;
    this.onErrorCallback = onError;
    this.isTracking = true;
    this.stepCount = 0;
    this.accelerationHistory = [];
    
    console.log('🚶 Starting step counting...');
    
    // Add motion event listener
    window.addEventListener('devicemotion', this.handleMotionEvent.bind(this), { passive: true });
  }

  /**
   * Stop step counting
   */
  stopCounting(): number {
    if (!this.isTracking) {
      return this.stepCount;
    }

    this.isTracking = false;
    window.removeEventListener('devicemotion', this.handleMotionEvent.bind(this));
    
    console.log('🚶 Stopped step counting. Total steps:', this.stepCount);
    return this.stepCount;
  }

  /**
   * Handle device motion events
   */
  private handleMotionEvent(event: DeviceMotionEvent): void {
    if (!this.isTracking || !event.accelerationIncludingGravity) {
      return;
    }

    const { x, y, z } = event.accelerationIncludingGravity;
    
    // Skip if any acceleration value is null
    if (x === null || y === null || z === null) {
      return;
    }

    // Calculate total acceleration magnitude
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    
    // Add to history for smoothing
    this.accelerationHistory.push(acceleration);
    if (this.accelerationHistory.length > this.historySize) {
      this.accelerationHistory.shift();
    }

    // Need enough history for step detection
    if (this.accelerationHistory.length < this.historySize) {
      return;
    }

    // Detect step using peak detection
    if (this.detectStep(acceleration)) {
      const now = Date.now();
      
      // Prevent double counting with minimum interval
      if (now - this.lastStepTime >= this.minStepInterval) {
        this.stepCount++;
        this.lastStepTime = now;
        
        console.log('🚶 Step detected! Count:', this.stepCount);
        this.onStepCallback?.(this.stepCount);
      }
    }
  }

  /**
   * Detect if current acceleration indicates a step
   */
  private detectStep(currentAcceleration: number): boolean {
    // Simple peak detection algorithm
    const historyLength = this.accelerationHistory.length;
    
    // Check if current acceleration is above threshold
    if (currentAcceleration < this.accelerationThreshold) {
      return false;
    }

    // Check if it's a peak (higher than surrounding values)
    const recentValues = this.accelerationHistory.slice(-5);
    const isLocalMaximum = recentValues.every(val => currentAcceleration >= val);
    
    // Additional validation: check for pattern consistency
    const average = this.accelerationHistory.reduce((sum, val) => sum + val, 0) / historyLength;
    const isSignificantPeak = currentAcceleration > average + 3;

    return isLocalMaximum && isSignificantPeak;
  }

  /**
   * Get current step count
   */
  getCurrentStepCount(): number {
    return this.stepCount;
  }

  /**
   * Check if step counting is active
   */
  isActive(): boolean {
    return this.isTracking;
  }

  /**
   * Check if device supports step counting
   */
  isStepCountingSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Reset step count (useful for testing)
   */
  resetStepCount(): void {
    this.stepCount = 0;
    this.accelerationHistory = [];
  }

  /**
   * Calibrate step detection sensitivity
   */
  calibrateThreshold(threshold: number, minInterval: number = 300): void {
    this.accelerationThreshold = threshold;
    this.minStepInterval = minInterval;
    console.log('🚶 Step detection calibrated:', { threshold, minInterval });
  }

  /**
   * Get step counting statistics
   */
  getStats(): {
    stepCount: number;
    isTracking: boolean;
    isSupported: boolean;
    permissionGranted: boolean;
    threshold: number;
  } {
    return {
      stepCount: this.stepCount,
      isTracking: this.isTracking,
      isSupported: this.isSupported,
      permissionGranted: this.permissionGranted,
      threshold: this.accelerationThreshold
    };
  }
}

// Export singleton instance
export const stepCounter = StepCounterService.getInstance();