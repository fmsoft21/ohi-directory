// assets/components/Navbar2.jsx - Add cart count badge
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import {
  Dialog,
  Transition,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import logo from "@/public/logo.png";
import profile from "@/public/profile.png";
import { ThemeToggle } from "./ThemeProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { Home, ShoppingBag, Box, User, MessageSquareReplyIcon, MessageSquare, Send } from "lucide-react";
import { useCart } from "@/assets/contexts/CartContext";
import { useMessages } from "@/assets/contexts/MessagesContext";

const navigation = [
  { id: 1, text: "Home", link: "/" },
  { id: 2, text: "Stores", link: "/stores" },
  { id: 3, text: "Products", link: "/products" },
  { id: 4, text: "About", link: "/about" },
];

export default function Navbar2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [providers, setProviders] = useState(null);
  const { data: session } = useSession();
  const { cartCount } = useCart(); // Add this

  const profileImage = session?.user?.image;

  const { unreadCount } = useMessages();

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    setAuthProviders();
  }, []);

  // Touch gesture handling (keep existing code)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const onTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - (startX ?? 0);
      const dy = Math.abs(t.clientY - (startY ?? 0));
      const threshold = 60;
      const rightEdgeThreshold = 80;
      const isSmallScreen = window.innerWidth < 1024;

      if (!isSmallScreen) return;

      if (
        !mobileMenuOpen &&
        startX > window.innerWidth - rightEdgeThreshold &&
        startX - t.clientX > threshold
      ) {
        setMobileMenuOpen(true);
        return;
      }

      if (mobileMenuOpen && dx > threshold) {
        setMobileMenuOpen(false);
        return;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Ohi!</span>
              <Image
                src={logo}
                alt="logo"
                className="h-10 w-auto dark:invert"
              />
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="h-6 w-6 dark:text-white"
              />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="text-sm/6 font-semibold dark:text-gray-50 text-gray-900 dark:hover:text-emerald-600 hover:text-emerald-600"
              >
                {item.text}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-2">
            <ThemeToggle />
            
            {/* Cart icon with badge */}
            {session && (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <ShoppingBag className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/messages" className="relative">
                  <Send className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {!session ? (
              <Link href="/auth/signin">
                <Button>Login | Register</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
               {session && (
  <Menu as="div" className="relative">
    <MenuButton className="flex items-center p-1.5">
      <span className="sr-only">Open user menu</span>
      <img
        alt={session?.user?.name || "profile"}
        src={profileImage || profile.src}
        className="h-8 w-8"
      />
      <span className="hidden lg:flex lg:items-center">
        <span aria-hidden="true" className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
          {session?.user?.name}
        </span>
        <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-800 dark:text-gray-100" />
      </span>
    </MenuButton>

    <MenuItems className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md dark:bg-zinc-900 dark:text-white bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
      <MenuItem>
        {({ active }) => (
          <a href="/dashboard" className={`block px-3 py-1 text-sm leading-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50' : ''}`}>
            Dashboard
          </a>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <a href="/dashboard/profile" className={`block px-3 py-1 text-sm leading-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50' : ''}`}>
            Profile
          </a>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <a href="/dashboard/products" className={`block px-3 py-1 text-sm leading-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50' : ''}`}>
            Products
          </a>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <a href="/dashboard/messages" className={`flex items-center justify-between px-3 py-1 text-sm leading-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50' : ''}`}>
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </a>
        )}
      </MenuItem>
      <MenuItem>
        {({ active }) => (
          <button onClick={() => signOut()} className={`w-full text-left block px-3 py-1 text-sm leading-6 hover:bg-zinc-50 dark:hover:bg-zinc-800 ${active ? 'bg-zinc-50' : ''}`}>
            Sign out
          </button>
        )}
      </MenuItem>
    </MenuItems>
  </Menu>
)}

              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu dialog */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="lg:hidden" onClose={setMobileMenuOpen}>
            <div className="fixed inset-0 z-40" />

            <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="h-full overflow-y-auto dark:bg-zinc-800 bg-white p-6 sm:ring-1 sm:ring-gray-900/10">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="-m-1.5 p-1.5">
                      <span className="sr-only">Ohi!</span>
                      <Image
                        src={logo}
                        alt="logo"
                        className="h-10 w-auto dark:invert"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-m-2.5 rounded-md p-2.5 text-gray-700"
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="h-6 w-6 dark:text-white"
                      />
                    </button>
                  </div>
                  <div className="mt-6 flow-root">
                    <div className="-my-6 divide-y divide-gray-500/10">
                      <div className="space-y-2 py-6 justify-center flex flex-col">
                        {navigation.map((item) => (
                          <Link
                            key={item.id}
                            href={item.link}
                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold dark:text-gray-50 text-gray-900 dark:hover:bg-gray-700 dark:hover:text-emerald-600 hover:text-emerald-600"
                          >
                            <button
                              type="button"
                              onClick={() => setMobileMenuOpen(false)}
                              className="-m-2.5 rounded-md p-2.5"
                            >
                              {item.text}
                            </button>
                          </Link>
                        ))}

                        <div className="-mx-3 flex items-center justify-between rounded-lg px-3 py-2 text-base/7 font-semibold dark:text-gray-50 text-gray-900">
                          <span className="">Theme</span>
                          <div className="ml-4">
                            <ThemeToggle className="border border-gray-400 dark:border-gray-50 rounded" />
                          </div>
                        </div>
                      </div>
                      <div className="py-6">
                        {!session ? (
                          <Link href="/auth/signin">
                            <Button
                              variant="outline"
                              onClick={() => signIn()}
                              className="w-full"
                            >
                              Login | Register
                            </Button>
                          </Link>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="w-full"
                            >
                              Logout
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Mobile bottom navigation with cart badge */}
        <nav
          aria-label="Mobile"
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl bg-white dark:bg-zinc-900 lg:hidden"
        >
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex justify-between items-center h-14">
              {/* <Link
                href="/"
                className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200"
              >
                <Home className="h-5 w-5" />
                <span className="mt-1">Home</span>
              </Link> */}

              <Link
                href="/stores"
                className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="mt-1">Stores</span>
              </Link>

              <Link
                href="/products"
                className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200"
              >
                <Box className="h-5 w-5" />
                <span className="mt-1">Products</span>
              </Link>

              {session && (
                <Link
                  href="/cart"
                  className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200 relative"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                  <span className="mt-1">Cart</span>
                </Link>
              )}
              {session && (
  <Link href="/dashboard/messages" className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200 relative">
    <MessageSquareReplyIcon className="h-5 w-5" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
    <span className="mt-1">Messages</span>
  </Link>
)}
              <Link
                href={session ? "/dashboard" : "/auth/signin"}
                className="flex flex-col items-center justify-center text-xs text-gray-700 dark:text-gray-200"
              >
                <User className="h-5 w-5" />
                <span className="mt-1">Profile</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
