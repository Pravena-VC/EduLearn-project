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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .trim()
    .min(1, {
      message: "Please enter your password",
    })
    .min(7, {
      message: "Password must be at least 7 characters long",
    }),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.setUser);

  const [userType, setUserType] = useState<"candidate" | "instructor">(
    "candidate"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleTabChange = (value: string) => {
    setUserType(value as "candidate" | "instructor");
  };

  const { isPending, mutate, error } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await _axios.post("/auth/login/", {
        email: data.email,
        password: data.password,
        user_type: userType == "candidate" ? "student" : "staff",
      });
      return res.data;
    },
    onSuccess(data) {
      toast.success("Login successful", {
        description: "You have successfully logged in.",
        duration: 5000,
      });

      const userId = data.data.id || data.data.email;

      updateUser({
        email: data.data.email,
        username: data.data.username,
        role: data.data.user_type,
        staff_id: data.data.staff_id ?? undefined,
        token: data.tokens?.access_token,
      });

      if (data?.data?.user_type === "staff") {
        router.push("/dashboard/instructor");
      } else if (data.data.user_type === "student") {
        router.push("/dashboard/candidate");
      }
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Login failed", {
        description: "Please check your credentials and try again.",
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
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
        <div className="flex flex-col space-y-3 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
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
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="test@example.com"
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
                            <FormItem className="relative">
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
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
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <Checkbox
                              id="rememberMe"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="rememberMe">Remember Me</Label>
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
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
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
                        {error?.message || "Login failed"}
                      </p>
                    )}
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="test@example.com"
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
                            <FormItem className="relative">
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder="********"
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
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <Checkbox
                              id="rememberMe"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="rememberMe">Remember Me</Label>
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
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="px-8 text-center text-sm text-muted-foreground">
          <div className="flex justify-center text-base">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="ml-1 hover:text-primary underline underline-offset-4 font-medium"
            >
              Sign up
            </Link>
          </div>
          <p className="mt-4">
            By continuing, you agree to our{" "}
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
            .
          </p>
        </div>
      </div>
    </div>
  );
}
