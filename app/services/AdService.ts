// This is a placeholder service that will be replaced with the actual AdMob implementation later

class AdService {
  private static instance: AdService;

  private constructor() {
    console.log('AdService initialized (placeholder)');
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  public async showInterstitialAd(): Promise<boolean> {
    console.log('Interstitial ad would show here (placeholder)');
    return false;
  }

  public isAdAvailable(): boolean {
    return false;
  }
}

export default AdService; 