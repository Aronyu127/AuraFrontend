import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export async function requestNonce(): Promise<string> {
  const res = await axios.post(`${API_BASE}/login`, {});
  return res.data.nonce;
}

export async function login(walletAddress: string, signature: string): Promise<{ token: string, userId: number }> {
  const res = await axios.post(`${API_BASE}/login`, { walletAddress, signature });
  return res.data;
}

export async function fetchUserGems(userId: number, token: string) {
  const res = await axios.get(`${API_BASE}/user/gems`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 