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

const url: string = `http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api`;
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

export const SubmitPraForm = async (
  body: any, // bisa diganti dengan type PraformRequest
  id: string,
): Promise<AuthVisitorResponse> => {
  try {
    const response = await axios.post(
      `${url}/_Auth/submit/pra-form`,
      body, // body JSON lengkap
      {
        headers: { 'Content-Type': 'application/json' },
        params: { id }, // id visitor sebagai query param
      },
    );
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
