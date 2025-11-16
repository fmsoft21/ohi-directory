"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";
import logo from "@/public/logo.png";
import AddProductForm from "./AddProductForm";
import { usePathname } from "next/navigation";
import {
  MessageSquareReplyIcon,
  Package,
  Search,
  Send,
  ShoppingBag,
  UserIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/assets/contexts/MessagesContext";

const breadcrumbs = [
  { label: "Dashboard", link: "/dashboard" },
  { label: "Products", link: "/dashboard/products" },
  { label: "Edit Products", link: "/dashboard/products" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardShell({ children }) {
  const { unreadCount } = useMessages();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: UserIcon,
      current: false,
    },
    {
      name: "Products",
      href: "/dashboard/products",
      icon: Package,
      current: false,
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: CalendarIcon,
      current: false,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: Send,
      badge: unreadCount > 0 ? unreadCount : null,
      current: false,
    },
    {
      name: "Purchases",
      href: "/dashboard/purchases",
      icon: ShoppingBag,
      current: false,
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // determine the most specific matching navigation item for the current pathname
  const activeHref = React.useMemo(() => {
    if (!pathname) return null;
    let best = null;
    for (const item of navigation) {
      if (!item.href) continue;
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        if (!best || item.href.length > best.length) best = item.href;
      }
    }
    // fallback to exact match
    if (!best) {
      for (const item of navigation) {
        if (item.href === pathname) return item.href;
      }
    }
    return best;
  }, [pathname]);

  return (
    <>
      {/*
            This example requires updating your template:
             ```
            <html class="h-full bg-white">
            <body class="h-full">
            ```
           */}
      <div data-oid="_qizuv:">
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
          data-oid="8aqoknh"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-zinc-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
            data-oid="jlzpx6s"
          />

          <div className="fixed inset-0 flex" data-oid="w3l7exx">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
              data-oid="b0:na3:"
            >
              <TransitionChild data-oid="lzdlhnc">
                <div
                  className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0"
                  data-oid="3m9lpt_"
                >
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                    data-oid="970mrnm"
                  >
                    <span className="sr-only" data-oid="w7vv7ta">
                      Close sidebar
                    </span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                      data-oid="a4pc.e0"
                    />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div
                className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-zinc-900 px-6 pb-4 ring-1 ring-white/10"
                data-oid="giroav6"
              >
                <div
                  className="flex h-16 shrink-0 items-center"
                  data-oid="7buexks"
                >
                  <Image
                    alt="Ohi!"
                    src={logo}
                    height={50}
                    width={50}
                    className="h-8 w-auto"
                    data-oid="tmbnlvv"
                  />
                </div>
                <nav className="flex flex-1 flex-col" data-oid="a53giv1">
                  <ul
                    role="list"
                    className="flex flex-1 flex-col gap-y-7"
                    data-oid="9v31qm0"
                  >
                    <li data-oid="7w8g4_y">
                      <ul
                        role="list"
                        className="-mx-2 space-y-1"
                        data-oid="1k59rl4"
                      >
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.href === activeHref
                                  ? "bg-emerald-600 text-white"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 items-center justify-between"
                              )}
                            >
                              <div className="flex items-center gap-x-3">
                                <item.icon
                                  aria-hidden="true"
                                  className="h-6 w-6 shrink-0"
                                />
                                {item.name}
                              </div>
                              {item.badge > 0 && (
                                <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                  {item.badge > 9 ? "9+" : item.badge}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="mt-auto">
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-800 hover:bg-zinc-800 hover:text-white"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="h-6 w-6 shrink-0"
                        />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div
          className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col"
          data-oid="2lop92j"
        >
          <div
            className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-100 dark:bg-zinc-900 px-6 pb-4"
            data-oid="efpe4fz"
          >
            <div className="flex h-16 shrink-0 items-center" data-oid="673zxdr">
              <Image
                alt="Ohi!"
                src={logo}
                height={60}
                width={60}
                className="ml-4 mt-2 dark:invert"
                data-oid="r8y9pm3"
              />
            </div>
            <nav className="flex flex-1 flex-col" data-oid="oe82nbo">
              <ul
                role="list"
                className="flex flex-1 flex-col gap-y-7"
                data-oid="kf9ahty"
              >
                <li data-oid="icbb_ie">
                  <ul
                    role="list"
                    className="-mx-2 space-y-1"
                    data-oid="dc0d1-x"
                  >
                    {navigation.map((item) => (
                      <li key={item.name} data-oid="f._z8.0">
                        <a
                          href={item.href}
                          className={classNames(
                            // use the computed activeHref to determine which item is active
                            item.href === activeHref
                              ? "bg-emerald-600 text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-600",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                          )}
                          data-oid="mchmei0"
                        >
                          <item.icon
                            aria-hidden="true"
                            className="h-6 w-6 shrink-0"
                            data-oid="eahjqt:"
                          />

                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="mt-auto" data-oid="0he6ue_">
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                    data-oid="-ugo857"
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0"
                      data-oid="5vh255y"
                    />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72 sm:mt-20" data-oid="lbcqr2x">
          <div
            className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-zinc-100 dark:bg-zinc-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
            data-oid="3amid.4"
          >
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
              data-oid="kl107pe"
            >
              <span className="sr-only" data-oid="kx-szlm">
                Open sidebar
              </span>
              <Bars3Icon
                aria-hidden="true"
                className="h-6 w-6"
                data-oid="pzu:m0s"
              />
            </button>

            {/* Separator */}
            <div
              aria-hidden="true"
              className="h-6 w-px bg-zinc-900/10 lg:hidden"
              data-oid="0-ftjvb"
            />

            <Breadcrumb className="hidden md:flex" data-oid="_yrxgfj">
              <BreadcrumbList data-oid=":zmsqti">
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem data-oid="5n:kyqx">
                      <BreadcrumbLink asChild data-oid="2uu6fgf">
                        <Link href={breadcrumb.link} data-oid="4ad6frt">
                          {breadcrumb.label}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator data-oid="syn:9o:" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="relative flex-1 md:flex-initial" data-oid="gmtr_wq">
              <Search
                className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground"
                data-oid="ppao1.4"
              />

              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] md:justify-end"
                data-oid="9txto_f"
              />
            </div>
          </div>

          <main className="py-10" data-oid="3:gsqly">
            <div className="px-4 sm:px-6 lg:px-8" data-oid="cpis5.d">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
