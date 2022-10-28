export type TransakUserData = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  dob: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postCode: string;
    countryCode: string;
  };
};

export type TransakConfig = {
  apiKey?: string;
  environment?: string;
  cryptoCurrencyCode?: string;
  defaultCryptoCurrency?: string;
  cryptoCurrencyList?: string;
  networks?: string;
  network?: string;
  walletAddress?: string;
  walletAddressesData?: string;
  fiatCurrency?: string;
  countryCode?: string;
  fiatAmount?: number;
  defaultNetwork?: string;
  defaultFiatAmount?: number;
  defaultCryptoAmount?: number;
  paymentMethod?: string;
  defaultPaymentMethod?: string;
  disablePaymentMethods?: string;
  email?: string;
  userData?: TransakUserData;
  partnerOrderId?: string;
  partnerCustomerId?: string;
  accessToken?: string;
  hostURL?: string;
  redirectURL?: string;
  disableWalletAddressForm?: boolean;
  isAutoFillUserData?: boolean;
  themeColor?: string;
  widgetHeight?: string;
  widgetWidth?: string;
  hideMenu?: boolean;
  hideExchangeScreen?: boolean;
  isDisableCrypto?: boolean;
  isFeeCalculationHidden?: boolean;
  exchangeScreenTitle?: string;
};