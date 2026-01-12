import axios from 'axios';
import {
  AuthVisitorRequest,
  AuthVisitorResponse,
  LoginRequest,
  LoginResponse,
  PraformRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RevokeTokenResponse,
} from './models/Users';
import axiosInstance from './interceptor';
import { GetProfileResponse } from './models/profile';

const url: string = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api`;
// const url: string = `https://classification-addressed-sections-sisters.trycloudflare.com/api`;
export const login = async (body: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${url}/_Auth/RequestToken`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (body: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  try {
    const response = await axios.post<RefreshTokenResponse>(`${url}/_Auth/RefreshToken`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const AuthVisitor = async (body: AuthVisitorRequest): Promise<AuthVisitorResponse> => {
  try {
    const response = await axios.post(`${url}/_Auth/VisitorRequest`, body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const SubmitPraForm = async (body: any, id: string): Promise<AuthVisitorResponse> => {
  try {
    const response = await axios.post(`${url}/_Auth/submit/pra-form`, body, {
      headers: { 'Content-Type': 'application/json' },
      params: { id },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const revokeToken = async (token: string): Promise<RevokeTokenResponse> => {
  try {
    const response = await axios.get<RevokeTokenResponse>(`${url}/_Auth/RevokeToken`, {
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
