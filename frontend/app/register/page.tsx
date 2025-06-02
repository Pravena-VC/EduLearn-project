"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, { message: "Please enter your username" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Please enter your email" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .trim()
      .min(1, { message: "Please enter your password" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "Please confirm your password" }),
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"candidate" | "instructor">(
    "candidate"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const handleTabChange = (value: string) => {
    setUserType(value as "candidate" | "instructor");
  };

  const { isPending, mutate, error } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await _axios.post(
        userType == "candidate"
          ? "/auth/register/student/"
          : "/auth/register/staff/",
        {
          username: data.username,
          password: data.password,
          email: data.email,
        }
      );
      return res.data;
    },
    onSuccess(data) {
      toast.success("Registration successful", {
        description: "Your account has been created successfully.",
        duration: 5000,
      });

      router.push("/login");
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Registration failed", {
        description: "Please check your information and try again.",
        duration: 5000,
      });
    },
  });

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      mutate(data);
    },
    [mutate]
  );

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[550px]">
        <div className="flex flex-col space-y-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Join EduLearn to access courses and learning resources
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center">Registration</CardTitle>
          </CardHeader>

          <Tabs
            defaultValue="candidate"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger
                  value="candidate"
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Candidate</span>
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Instructor</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="candidate">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="pt-3 space-y-6">
                    {error && (
                      <p className="text-sm text-red-500 text-center">
                        {error?.message || "Registration failed"}
                      </p>
                    )}

                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="username"
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="yourname@example.com"
                                  type="email"
                                  autoCapitalize="none"
                                  autoComplete="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
                                  autoCapitalize="none"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
                                  autoCapitalize="none"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 pt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the{" "}
                                <Link
                                  href="/terms"
                                  className="hover:text-primary underline underline-offset-4"
                                >
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                  href="/privacy"
                                  className="hover:text-primary underline underline-offset-4"
                                >
                                  Privacy Policy
                                </Link>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col pb-6 pt-2">
                    <Button
                      className="w-full h-11 text-base"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <div className="h-4 w-4 border-t-2 border-b-2 border-background animate-spin rounded-full mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Candidate Account"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="instructor">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="pt-3 space-y-6">
                    {error && (
                      <p className="text-sm text-red-500 text-center">
                        {error?.message || "Registration failed"}
                      </p>
                    )}

                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="username"
                                  autoCapitalize="none"
                                  autoCorrect="off"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="yourname@example.com"
                                  type="email"
                                  autoCapitalize="none"
                                  autoComplete="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
                                  autoCapitalize="none"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
                                  autoCapitalize="none"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 pt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div>
                              <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the{" "}
                                <Link
                                  href="/terms"
                                  className="hover:text-primary underline underline-offset-4"
                                >
                                  Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                  href="/privacy"
                                  className="hover:text-primary underline underline-offset-4"
                                >
                                  Privacy Policy
                                </Link>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col pb-6 pt-2">
                    <Button
                      className="w-full h-11 text-base"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <div className="h-4 w-4 border-t-2 border-b-2 border-background animate-spin rounded-full mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Instructor Account"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="hover:text-primary underline underline-offset-4 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
