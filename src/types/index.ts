export interface ApiResponse<T> {
  success?: boolean;
  status?: boolean;
  message: string;
  errorcode?: string;
  data: T;
}

export interface LoginResponse {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  state: any;
}

export interface HealthCheckData {
  clientcode: string;
  name: string;
  email: string;
  mobileno: string;
  exchanges: string[];
  products: string[];
  lastlogintime: string;
  broker: string;
}

export interface Settings {
  _id: string;
  recordId: number;
  isLiveOrdresAllowed: boolean;
}

export interface Order {
  _id: string;
  orderid: string;
  uniqueorderid: string;
  type: 'BUY' | 'SELL';
  date: string;
  instrument: string;
  price: number;
  qty: number;
  exchange: string;
  symboltoken: string;
  strikeprice: string;
  optiontype: string;
  expirydate: string;
  orderStatus: string;
  description: string;
  superTrendValue: number;
  instrumentPrice: number;
  __v: number;
}

export interface SuperTrend {
  _id: string;
  superTrendValue: number;
  superTrendDirection: 'up' | 'down';
  createdAt: string;
  __v: number;
}

export interface User {
  name: string;
  clientcode: string;
  email: string;
  mobileno: string;
}