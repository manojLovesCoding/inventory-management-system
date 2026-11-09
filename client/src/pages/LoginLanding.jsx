import React from "react";
import LoginLeftSide from "../components/LoginLeftSide";
import { ArrowRightIcon, ShieldIcon, Building2Icon, HeartIcon } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const LoginLanding = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const portalOptions = [
    {
      to: "/login/admin",
      title: "Admin Portal",
      description:
        "Manage inventory, stock, purchases, requests, and administration.",
      icon: ShieldIcon,
    },
    {
      to: "/login/department",
      title: "Department Portal",
      description: "Submit and manage department inventory requests.",
      icon: Building2Icon,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginLeftSide />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* header */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-3">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Select your portal to securely access the system.
            </p>
          </div>

          {/* portal list */}
          <div className="space-y-4">
            {portalOptions.map((portal) => {
              const IconComponent = portal.icon;
              return (
                <Link
                  key={portal.to}
                  to={portal.to}
                  className="group block bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-md border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-100 transition-colors">
                        <IconComponent className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-800 group-hover:text-indigo-600 mb-0.5 transition-colors">
                          {portal.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {portal.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* footer
          <div className="mt-12 text-center text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} Government First Grade College,
              Raichur.
              <br />
              All rights reserved.
            </p>

            <p className="mt-2">Designed and Developed by Manoj Kumar P V</p>
          </div> */}
          <div className="mt-12 text-center text-sm text-slate-400">
            <p className="text-slate-500">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-indigo-600">
                Government First Grade College
              </span>
              , <span className="text-indigo-500">Raichur</span>.
              <br />
              <span className="text-slate-400">All rights reserved.</span>
            </p>

            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500">
              Designed & Developed with
              <span className="text-rose-500">
                <HeartIcon className="w-3.5 h-3.5 fill-current" />
              </span>
              by
              <span className="font-semibold text-indigo-600">
                Manoj Kumar P V
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
