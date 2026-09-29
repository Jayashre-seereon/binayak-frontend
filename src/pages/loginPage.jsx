import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/api/authApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const setSelectedStore = useAuthStore((state) => state.setSelectedStore);
  const navigate = useNavigate();

  const normalizeStore = (source) => {
    if (!source) return null;

    const id = source.id ?? source.storeId ?? source.store_id ?? source._id;

    if (!id) return null;

    return {
      ...source,
      id,
    };
  };

  const onSubmit = async (data) => {
    try {
      const response = await loginApi({
        email: data.email,
        password: data.password,
      });

      const payload = response.data?.data || response.data;
      const user = payload?.user || payload;
      const token = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken;
      const role = user?.role || payload?.role;

      setSession({
        user,
        token,
        refreshToken,
        role,
      });

      if (role === "ADMIN") {
        toast.success("Login successful. Select a store to continue.");
        navigate("/select-store");
      } else {
        const currentStore =
          normalizeStore(user) ||
          normalizeStore(user?.store) ||
          normalizeStore(user?.storeInfo) ||
          normalizeStore(user?.storeData) ||
          normalizeStore(payload?.store) ||
          normalizeStore(payload?.storeInfo) ||
          normalizeStore(payload?.storeData);

        setSelectedStore(currentStore);
        toast.success("Login successful. Redirecting to dashboard.");
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";
      toast.error(message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(245,158,11,0.22),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(37,99,235,0.22),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-black/30 sm:grid sm:grid-cols-[0.9fr_1.1fr] sm:py-0">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-10 text-white sm:flex sm:flex-col sm:justify-between">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[24px] border-white/10" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
            <div className="relative">
              <div className="mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-xl">
                <img src={logo} alt="Binayak Jewellers logo" className="h-full w-full object-contain" />
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-100">Welcome to</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight">Binayak<br />Jewellers</h1>
              <p className="mt-5 max-w-xs text-sm leading-6 text-amber-50/90">
                A simple, secure workspace for managing your jewellery business.
              </p>
            </div>
            <p className="relative text-xs text-amber-100/80">Jewellery ERP Dashboard</p>
          </div>

          <CardContent className="p-7 sm:p-10">
            <div className="mb-8 flex items-center gap-3 sm:hidden">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-amber-50 p-1">
                <img src={logo} alt="Binayak Jewellers logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Binayak Jewellers</div>
                <div className="text-xs text-slate-500">Jewellery ERP</div>
              </div>
            </div>

            <p className="text-sm font-medium text-amber-600">Secure access</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue to your dashboard.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="h-11 border-slate-200 bg-slate-50 px-3 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-11 border-slate-200 bg-slate-50 px-3 pr-10 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

              <Button className="mt-2 h-11 w-full rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800">Sign in</Button>
            </form>
            <p className="mt-8 text-center text-xs text-slate-400">Your account information is protected and secure.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
