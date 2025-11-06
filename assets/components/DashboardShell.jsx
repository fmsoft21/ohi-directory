/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
"use client";

import { useState } from "react";
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
import { Package, UserIcon } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  {
    name: "Profile",
    href: "/dashboard/profile/",
    icon: UserIcon,
    current: false,
  },
  {
    name: "Products",
    href: "/dashboard/products/",
    icon: Package,
    current: false,
  },
  { name: "Orders", href: "#", icon: CalendarIcon, current: false },
  { name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
  { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
                          <li key={item.name} data-oid=":bsoz91">
                            <a
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? "bg-emerald-600 text-white"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                              )}
                              data-oid="lfj:u7q"
                            >
                              <item.icon
                                aria-hidden="true"
                                className="h-6 w-6 shrink-0"
                                data-oid="143zknh"
                              />

                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    
                    <li className="mt-auto" data-oid="yfv8hlk">
                      <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-800 hover:bg-zinc-800 hover:text-white"
                        data-oid="a73qlmu"
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="h-6 w-6 shrink-0"
                          data-oid="t.sys3c"
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
            className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-zinc-900 px-6 pb-4"
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
                            item.current
                              ? "bg-emerald-600 text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
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

        <div className="lg:pl-72 mt-20" data-oid="lbcqr2x">
          <div
            className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
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

            <div
              className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6"
              data-oid="ihjpxnu"
            >
              <form
                action="#"
                method="GET"
                className="relative flex flex-1"
                data-oid="33m0wa3"
              >
                <label
                  htmlFor="search-field"
                  className="sr-only"
                  data-oid="8:n9duc"
                >
                  Search
                </label>
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-cursor absolute inset-y-0 ml-3 mr-2 h-full w-5 dark:text-gray-600 text-gray-800"
                  data-oid="zjz0_d-"
                />

                <input
                  id="search-field"
                  name="search"
                  type="search"
                  // placeholder="Search..."
                  className="rounded h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 dark:text-white dark:bg-zinc-800 placeholder:text-gray-800 focus:ring-0 sm:text-sm"
                  data-oid="np66.x3"
                />
              </form>
              <div
                className="flex items-center gap-x-4 lg:gap-x-6"
                data-oid="zmd18mg"
              >
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-800 hover:text-gray-500"
                  data-oid="b6jrty1"
                >
                  <span className="sr-only" data-oid="e7b:_ez">
                    View notifications
                  </span>
                  <BellIcon
                    aria-hidden="true"
                    className="h-6 w-6"
                    data-oid="n9tkxgk"
                  />
                </button>

                {/* Separator */}
                <div
                  aria-hidden="true"
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-900/10"
                  data-oid="sr27q3-"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative" data-oid="lskplxb">
                  <MenuButton
                    className="-m-1.5 flex items-center p-1.5"
                    data-oid="bih1eel"
                  >
                    <span className="sr-only" data-oid="yoa0w.c">
                      Open user menu
                    </span>
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="h-8 w-8 rounded-full bg-zinc-50"
                      data-oid="ytb0tnv"
                    />

                    <span
                      className="hidden lg:flex lg:items-center"
                      data-oid="_4rr-bw"
                    >
                      <span
                        aria-hidden="true"
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                        data-oid="hif6k02"
                      >
                        Tom Cook
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 text-gray-800"
                        data-oid="s6f5n1f"
                      />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                    data-oid="hubtkna"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name} data-oid="dal9y24">
                        <a
                          href={item.href}
                          className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-zinc-50"
                          data-oid="8tv:0p4"
                        >
                          {item.name}
                        </a>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
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
