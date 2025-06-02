import { _axios } from "../axios";

export async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("profile_picture", file);
  const response = await _axios.post<{
    success: boolean;
    message: string;
    data: { profile_picture_url: string };
  }>("/profile/student/profile-picture/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
