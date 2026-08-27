import {
  BoxesIcon,
  ShieldCheckIcon,
  PackageCheckIcon,
} from "lucide-react";

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex md:w-1/2 min-h-screen bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />

      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-indigo-300/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center w-full px-10 lg:px-16 xl:px-20">
        {/* Logo / Icon */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <BoxesIcon size={30} strokeWidth={1.7} />
          </div>
        </div>

        {/* Heading */}
        <div className="max-w-lg">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-4">
            Inventory Management System
          </p>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight leading-tight">
            Manage your
            <span className="block text-indigo-200">
              inventory smarter.
            </span>
          </h1>

          <p className="mt-6 text-indigo-100/80 text-base lg:text-lg leading-relaxed max-w-md">
            A secure platform for managing inventory,
            purchases, stock movements, departments,
            suppliers, and system operations.
          </p>
        </div>

        {/* Features */}
        <div className="mt-10 space-y-4 max-w-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <ShieldCheckIcon
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="font-medium text-white">
                Secure Access
              </p>

              <p className="text-sm text-indigo-100/60">
                Role-based authentication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <PackageCheckIcon
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="font-medium text-white">
                Inventory Control
              </p>

              <p className="text-sm text-indigo-100/60">
                Track and manage stock efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs text-indigo-200/60">
            © {new Date().getFullYear()} Manoj Kumar.
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginLeftSide;
