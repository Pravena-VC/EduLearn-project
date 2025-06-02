import { _axios } from "../axios";

export interface ProfileData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location?: string;
  bio?: string;
  skills: string[];
  website_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  profile_picture_url?: string;
}

export async function fetchStudentProfile() {
  const response = await _axios.get<{
    success: boolean;
    data: ProfileData;
  }>("/profile/student/");
  return response.data;
}

export async function updateStudentProfile(data: any) {
  const response = await _axios.put<{
    success: boolean;
    message: string;
    data: ProfileData;
  }>("/profile/student/", data);
  return response.data;
}
