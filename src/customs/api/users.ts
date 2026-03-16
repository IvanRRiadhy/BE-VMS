import axios from 'axios';
import {
  AuthVisitorRequest,
  AuthVisitorResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RevokeTokenResponse,
} from './models/Users';
import axiosInstance from './interceptor';
import { GetProfileResponse } from './models/profile';
import { AnyAaaaRecord } from 'dns';

export const login = async (body: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(`/_Auth/RequestToken`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (body: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  try {
    const response = await axiosInstance.post<RefreshTokenResponse>(`/_Auth/RefreshToken`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const AuthVisitor = async (body: AuthVisitorRequest): Promise<AuthVisitorResponse> => {
  try {
    const response = await axiosInstance.post(`/on-portal/VisitorRequest`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const SubmitPraForm = async (body: any): Promise<AuthVisitorResponse> => {
  try {
    const response = await axiosInstance.post(`/on-portal/submit/pra-form`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const revokeToken = async (token: string): Promise<RevokeTokenResponse> => {
  try {
    const response = await axiosInstance.get<RevokeTokenResponse>(`/_Auth/RevokeToken`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (token: string): Promise<GetProfileResponse> => {
  try {
    const response = await axiosInstance.get('/profile/me', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw error.response.data;
    }
    throw error;
  }
};

// POST Sharelink
export const invitationLink = async (token: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/_Auth/invitation-link', data, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getInvitationLink = async (
  token: string,
  d: string,
  code: string,
  timestamp: string,
  sig: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get('/on-portal/invitation-link', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: { d, code, timestamp, sig },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};

export const getPermission = async (token: string): Promise<any> => {
  try {
    const response = await axiosInstance.get('/user-permission', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { collection: [] };
    }
    throw error;
  }
};
