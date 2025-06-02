"use client";

import CandidateHeader from "@/components/candidate-header";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileData, fetchStudentProfile } from "@/lib/api/profile";
import { uploadProfilePicture } from "@/lib/api/upload-profile-picture";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import {
  Edit,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Twitter,
  User,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ProfilePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: fetchStudentProfile,
    // Don't refetch automatically on window focus for profile data
    refetchOnWindowFocus: false,
  });

  const profileData: ProfileData = data?.data || {
    email: user?.email || "",
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    bio: "",
    skills: [],
    website_url: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
  };

  // Format display name from first and last name
  const displayName =
    profileData.first_name && profileData.last_name
      ? `${profileData.first_name} ${profileData.last_name}`
      : profileData.first_name || user?.username || "Your Name";

  // Placeholder data for education and experience sections
  interface Education {
    institution: string;
    degree: string;
    year: string;
  }

  interface Experience {
    company: string;
    position: string;
    period: string;
    description: string;
  }

  const education: Education[] = [];
  const experience: Experience[] = [];

  // Open dialog handler
  const handleEditProfile = () => {
    setIsDialogOpen(true);
  };

  // Handle profile picture upload
  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadProfilePicture(file);
      if (res.success) {
        setProfilePicUrl(res.data.profile_picture_url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 mx-8">
      <CandidateHeader />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <Button onClick={handleEditProfile}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load profile. Please try again later.
        </div>
      )}

      {/* Profile data */}
      {!isLoading && !error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar + upload */}
              <div className="flex flex-col items-center gap-2 mr-8">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={
                      profilePicUrl ||
                      profileData.profile_picture_url ||
                      "/placeholder.jpg"
                    }
                    alt={displayName}
                  />
                  <AvatarFallback>{displayName[0]}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleProfilePicChange}
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Change Photo"
                  )}
                </Button>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">About Me</h3>
                  <p className="text-sm text-muted-foreground">
                    {profileData.bio || "No bio provided yet"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                    {profileData.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profileData.phone_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {profileData.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={profileData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {new URL(profileData.website_url).hostname}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {profileData.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {profileData.github_url && (
                    <a
                      href={profileData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Badge variant="outline" className="h-8 px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                          />
                        </svg>
                        GitHub
                      </Badge>
                    </a>
                  )}
                  {profileData.linkedin_url && (
                    <a
                      href={profileData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Badge variant="outline" className="h-8 px-3">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Badge>
                    </a>
                  )}
                  {profileData.twitter_url && (
                    <a
                      href={profileData.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary"
                    >
                      <Badge variant="outline" className="h-8 px-3">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Badge>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProfileEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={profileData}
      />
    </div>
  );
}
