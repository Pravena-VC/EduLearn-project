"use client";

import InstructorHeader from "@/components/Instructor-Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImagePlus, Loader2, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  bio: z.string().optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  first_name: z.string().min(1, { message: "Please enter your first name" }),
  last_name: z.string().min(1, { message: "Please enter your last name" }),
});

export default function InstructorProfilePage() {
  const user: any = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [, setProfilePicture] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const initialLoadDone = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await _axios.get("/staff/update/");
      return res.data.data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user?.bio || "",
      email: user?.email || "",
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    if (profileData && !initialLoadDone.current) {
      form.reset({
        bio: profileData.bio || "",
        email: profileData.email || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
      });

      if (profileData.profile_picture) {
        setAvatarPreview(profileData.profile_picture);
      }

      if (
        user?.bio !== profileData.bio ||
        user?.email !== profileData.email ||
        user?.profile_picture !== profileData.profile_picture
      ) {
        setUser({
          ...(user as any),
          bio: profileData.bio,
          email: profileData.email,
          profile_picture: profileData.profile_picture,
        });
      }

      initialLoadDone.current = true;
    }
  }, [profileData]);

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await _axios.put("/staff/update/", data);
      return res.data;
    },
    onSuccess(data) {
      setUser({
        ...user,
        ...data.data,
      });

      toast.success("Profile updated successfully", {
        description: "Your profile information has been updated.",
        duration: 5000,
      });
    },
    onError(error: any) {
      toast.error("Failed to update profile", {
        description: error.response?.data?.message || "An error occurred",
        duration: 5000,
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await _axios.post("/staff/profile-picture/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess(data) {
      setUser({
        ...(user as any),
        profile_picture: data.data.profile_picture_url,
      });

      setAvatarPreview(data.data.profile_picture_url);
      setIsUploadingAvatar(false);

      toast.success("Profile picture updated", {
        description: "Your avatar has been updated successfully.",
        duration: 5000,
      });
    },
    onError(error: any) {
      setIsUploadingAvatar(false);
      toast.error("Failed to update profile picture", {
        description: error.response?.data?.message || "An error occurred",
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsUploadingAvatar(true);
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <InstructorHeader />

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your instructor profile and contact information.
        </p>
      </div>
      {/* Avatar Upload UI */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative group cursor-pointer"
          onClick={handleAvatarClick}
        >
          <Avatar className="w-24 h-24 border-2 border-primary shadow-md group-hover:opacity-80 transition-opacity duration-200">
            <AvatarImage
              src={avatarPreview || undefined}
              alt="Profile Avatar"
            />
            <AvatarFallback>
              {user?.first_name && user?.last_name ? (
                `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
              ) : (
                <UserCircle2 className="w-16 h-16 text-muted-foreground" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-white shadow-md group-hover:scale-110 transition-transform">
            {isUploadingAvatar ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <ImagePlus className="w-5 h-5 text-white" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isUploadingAvatar}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Click avatar to change
        </span>
      </div>
      {/* End Avatar Upload UI */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        readOnly
                        placeholder="Email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell students about yourself and your teaching experience"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    isPending || isUploadingAvatar || !form.formState.isDirty
                  }
                >
                  {isPending || isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
